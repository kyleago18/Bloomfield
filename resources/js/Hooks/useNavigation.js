import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDrivingRoute } from '../Services/osrmService';
import {
    haversineDistance,
    bearing,
    isValidCoord,
    closestPointIndex,
    remainingDistanceAlongRoute,
    routeProgress,
    formatDistance,
    formatDistanceKm,
    formatDuration,
    formatEtaClock,
} from '../Services/geoUtils';

/** Meters off the polyline before we request a new route */
const OFF_ROUTE_THRESHOLD_M = 45;
/** Minimum gap between reroute attempts */
const REROUTE_COOLDOWN_MS = 8000;
/** Consider arrived when within this distance of the shop */
const ARRIVAL_THRESHOLD_M = 25;
/** Ignore heading derived from tiny GPS jitter */
const MIN_MOVE_FOR_BEARING_M = 3;

function geoErrorMessage(err) {
    if (!err) return 'Unable to read your GPS location.';
    switch (err.code) {
        case 1: // PERMISSION_DENIED
            return 'Location permission denied. Please allow location access in your browser settings to navigate.';
        case 2: // POSITION_UNAVAILABLE
            return 'GPS signal lost or unavailable. Move to an open area and try again.';
        case 3: // TIMEOUT
            return 'Timed out waiting for GPS. Check that location services are enabled.';
        default:
            return err.message || 'Unable to read your GPS location.';
    }
}

/**
 * Live turn-by-turn navigation from the user's GPS position to a destination.
 *
 * @param {{ lat: number, lng: number }|null} destination
 * @param {{ shopName?: string }} [options]
 */
export default function useNavigation(destination, options = {}) {
    const shopName = options.shopName || 'Flower shop';

    const [isNavigating, setIsNavigating] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [heading, setHeading] = useState(null);
    const [routeCoords, setRouteCoords] = useState(null);
    const [navSteps, setNavSteps] = useState([]);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [remainingDist, setRemainingDist] = useState(null);
    const [remainingTime, setRemainingTime] = useState(null);
    const [totalDist, setTotalDist] = useState(null);
    const [totalDuration, setTotalDuration] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isRerouting, setIsRerouting] = useState(false);
    const [error, setError] = useState(null);
    const [gpsWarning, setGpsWarning] = useState(null);
    const [arrived, setArrived] = useState(false);

    const watchIdRef = useRef(null);
    const prevLocationRef = useRef(null);
    const routeMetaRef = useRef({ coords: null, totalDist: 0, totalDuration: 0 });
    const navStepsRef = useRef([]);
    const isReroutingRef = useRef(false);
    const lastRerouteTimeRef = useRef(0);
    const abortRef = useRef(null);
    const destinationRef = useRef(destination);

    useEffect(() => {
        destinationRef.current = destination;
    }, [destination]);

    useEffect(() => {
        navStepsRef.current = navSteps;
    }, [navSteps]);

    const clearWatch = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    const applyRoute = useCallback((result) => {
        routeMetaRef.current = {
            coords: result.coords,
            totalDist: result.totalDist,
            totalDuration: result.totalDuration,
        };
        setRouteCoords(result.coords);
        setNavSteps(result.steps);
        navStepsRef.current = result.steps;
        setTotalDist(result.totalDist);
        setTotalDuration(result.totalDuration);
        setRemainingDist(result.totalDist);
        setRemainingTime(result.totalDuration);
        setProgress(0);
        setCurrentStepIdx(0);
    }, []);

    const fetchRoute = useCallback(async (origin, dest) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        return fetchDrivingRoute(origin, dest, { signal: controller.signal });
    }, []);

    const updateStepIndex = useCallback((remDistM) => {
        const steps = navStepsRef.current;
        if (!steps.length) return;

        // Walk steps from the end: remaining distance shrinks as we complete steps
        let remainingFromEnd = 0;
        for (let i = steps.length - 1; i >= 0; i--) {
            remainingFromEnd += steps[i].distanceM;
            if (remDistM <= remainingFromEnd) {
                setCurrentStepIdx(i);
                return;
            }
        }
        setCurrentStepIdx(Math.max(0, steps.length - 1));
    }, []);

    const handlePosition = useCallback(
        async (pos) => {
            const dest = destinationRef.current;
            const curr = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };

            setGpsWarning(null);
            setAccuracy(
                Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null
            );

            let nextHeading = null;
            if (
                pos.coords.heading != null &&
                !Number.isNaN(pos.coords.heading) &&
                pos.coords.heading >= 0
            ) {
                nextHeading = pos.coords.heading;
            } else if (prevLocationRef.current) {
                const moved = haversineDistance(prevLocationRef.current, curr);
                if (moved >= MIN_MOVE_FOR_BEARING_M) {
                    nextHeading = bearing(prevLocationRef.current, curr);
                }
            }
            prevLocationRef.current = curr;
            setUserLocation(curr);
            if (nextHeading !== null) setHeading(nextHeading);

            if (!dest || !isValidCoord(dest)) return;

            const distToDest = haversineDistance(curr, dest);
            if (distToDest < ARRIVAL_THRESHOLD_M) {
                setArrived(true);
                setRemainingDist(0);
                setRemainingTime(0);
                setProgress(1);
                return;
            }

            const meta = routeMetaRef.current;
            if (!meta.coords?.length) return;

            const { idx, minDist } = closestPointIndex(meta.coords, curr);
            const remDist = remainingDistanceAlongRoute(meta.coords, idx);
            const fraction =
                meta.totalDist > 0 ? remDist / meta.totalDist : 0;
            const remTime = Math.round((meta.totalDuration || 0) * fraction);

            setRemainingDist(remDist);
            setRemainingTime(remTime);
            setProgress(routeProgress(meta.totalDist, remDist));
            updateStepIndex(remDist);

            const now = Date.now();
            if (
                minDist > OFF_ROUTE_THRESHOLD_M &&
                !isReroutingRef.current &&
                now - lastRerouteTimeRef.current > REROUTE_COOLDOWN_MS
            ) {
                isReroutingRef.current = true;
                lastRerouteTimeRef.current = now;
                setIsRerouting(true);
                try {
                    const result = await fetchRoute(curr, dest);
                    applyRoute(result);
                } catch (err) {
                    if (err?.name !== 'AbortError') {
                        setGpsWarning(
                            'You left the route. Recalculating failed — retrying as you move.'
                        );
                    }
                } finally {
                    setIsRerouting(false);
                    isReroutingRef.current = false;
                }
            }
        },
        [applyRoute, fetchRoute, updateStepIndex]
    );

    const startNavigation = useCallback(async () => {
        setError(null);
        setGpsWarning(null);
        setArrived(false);

        const dest = destinationRef.current;
        if (!isValidCoord(dest)) {
            setError(
                `Cannot navigate: ${shopName} does not have valid map coordinates. Please contact the shop.`
            );
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser or device.');
            return;
        }

        setIsStarting(true);
        setIsNavigating(true);

        const getPosition = () =>
            new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                });
            });

        try {
            const pos = await getPosition();
            const origin = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
            setUserLocation(origin);
            setAccuracy(
                Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null
            );
            prevLocationRef.current = origin;

            if (
                pos.coords.heading != null &&
                !Number.isNaN(pos.coords.heading) &&
                pos.coords.heading >= 0
            ) {
                setHeading(pos.coords.heading);
            }

            const result = await fetchRoute(origin, dest);
            applyRoute(result);
        } catch (err) {
            clearWatch();
            setIsNavigating(false);
            if (err?.code === 1 || err?.code === 2 || err?.code === 3) {
                setError(geoErrorMessage(err));
            } else if (err?.code === 'INVALID_COORDS') {
                setError(err.message);
            } else if (err?.name === 'AbortError') {
                setError(null);
            } else {
                setError(
                    err?.message ||
                        'Could not start navigation. Please try again.'
                );
            }
            setIsStarting(false);
            return;
        }

        clearWatch();
        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePosition,
            (err) => {
                setGpsWarning(geoErrorMessage(err));
            },
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
        );

        setIsStarting(false);
    }, [applyRoute, clearWatch, fetchRoute, handlePosition, shopName]);

    const stopNavigation = useCallback(() => {
        if (abortRef.current) abortRef.current.abort();
        clearWatch();
        setIsNavigating(false);
        setIsStarting(false);
        setRouteCoords(null);
        setNavSteps([]);
        setCurrentStepIdx(0);
        setRemainingDist(null);
        setRemainingTime(null);
        setTotalDist(null);
        setTotalDuration(null);
        setProgress(0);
        setIsRerouting(false);
        setArrived(false);
        setHeading(null);
        setAccuracy(null);
        setError(null);
        setGpsWarning(null);
        prevLocationRef.current = null;
        routeMetaRef.current = { coords: null, totalDist: 0, totalDuration: 0 };
        isReroutingRef.current = false;
        navStepsRef.current = [];
    }, [clearWatch]);

    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
            clearWatch();
        };
    }, [clearWatch]);

    const currentStep = navSteps[currentStepIdx] || null;
    const nextStep = navSteps[currentStepIdx + 1] || null;

    return {
        isNavigating,
        isStarting,
        userLocation,
        accuracy,
        heading,
        routeCoords,
        navSteps,
        currentStep,
        nextStep,
        currentStepIdx,
        remainingDist,
        remainingTime,
        totalDist,
        totalDuration,
        progress,
        remainingDistStr: remainingDist != null ? formatDistance(remainingDist) : null,
        remainingDistKmStr:
            remainingDist != null ? formatDistanceKm(remainingDist) : null,
        remainingTimeStr:
            remainingTime != null ? formatDuration(remainingTime) : null,
        etaClockStr:
            remainingTime != null ? formatEtaClock(remainingTime) : null,
        isRerouting,
        arrived,
        error,
        gpsWarning,
        startNavigation,
        stopNavigation,
        destinationValid: isValidCoord(destination),
    };
}
