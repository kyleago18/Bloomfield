import { useState, useEffect } from 'react';
import { fetchDrivingRoute } from '../Services/osrmService';
import { isValidCoord } from '../Services/geoUtils';

/**
 * Static OSRM route preview (no live GPS tracking).
 * Use useNavigation for turn-by-turn live navigation.
 */
export default function useOSRM(origin, destination) {
    const [routeData, setRouteData] = useState(null);
    const [distanceStr, setDistanceStr] = useState('');
    const [travelTimeStr, setTravelTimeStr] = useState('');
    const [navSteps, setNavSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isValidCoord(origin) || !isValidCoord(destination)) {
            setRouteData(null);
            setDistanceStr('');
            setTravelTimeStr('');
            setNavSteps([]);
            setError(null);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchDrivingRoute(origin, destination, {
                    signal: controller.signal,
                });
                setRouteData(result.coords);
                setDistanceStr(result.distanceStr);
                setTravelTimeStr(result.travelTimeStr);
                setNavSteps(result.steps);
            } catch (err) {
                if (err?.name === 'AbortError') return;
                setError(err.message || 'Could not calculate a route.');
                setRouteData(null);
                setNavSteps([]);
                setDistanceStr('');
                setTravelTimeStr('');
            } finally {
                setIsLoading(false);
            }
        };

        run();
        return () => controller.abort();
    }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

    return { routeData, distanceStr, travelTimeStr, navSteps, isLoading, error };
}
