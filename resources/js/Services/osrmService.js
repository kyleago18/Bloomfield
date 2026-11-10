/**
 * OSRM Routing API client.
 * Uses the public demo server; swap OSRM_BASE_URL for a self-hosted instance in production.
 */

import { formatDistance, formatDuration } from './geoUtils';

export const OSRM_BASE_URL = 'https://router.project-osrm.org';

const MANEUVER_MAP = {
    turn_left: { icon: '↰', label: 'Turn left' },
    turn_right: { icon: '↱', label: 'Turn right' },
    turn_slight_left: { icon: '↖', label: 'Keep slight left' },
    turn_slight_right: { icon: '↗', label: 'Keep slight right' },
    turn_sharp_left: { icon: '↩', label: 'Sharp left' },
    turn_sharp_right: { icon: '↪', label: 'Sharp right' },
    turn_uturn: { icon: '⇅', label: 'Make a U-turn' },
    depart: { icon: '↑', label: 'Head' },
    arrive: { icon: '◎', label: 'Arrive at destination' },
    roundabout: { icon: '↻', label: 'Enter roundabout' },
    rotary: { icon: '↻', label: 'Enter rotary' },
    merge: { icon: '⇉', label: 'Merge' },
    fork_left: { icon: '↙', label: 'Keep left at fork' },
    fork_right: { icon: '↘', label: 'Keep right at fork' },
    continue: { icon: '↑', label: 'Continue straight' },
    new_name: { icon: '↑', label: 'Continue' },
    end_of_road_left: { icon: '↰', label: 'Turn left at end of road' },
    end_of_road_right: { icon: '↱', label: 'Turn right at end of road' },
};

export function maneuverInfo(type, modifier) {
    const key = `${type}${modifier ? `_${modifier}` : ''}`;
    return MANEUVER_MAP[key] || MANEUVER_MAP[type] || { icon: '→', label: 'Continue' };
}

/**
 * Fetch the fastest driving route between origin and destination.
 *
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{
 *   coords: [number, number][],
 *   steps: object[],
 *   totalDist: number,
 *   totalDuration: number,
 *   distanceStr: string,
 *   travelTimeStr: string,
 * }>}
 */
export async function fetchDrivingRoute(origin, destination, options = {}) {
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
        const err = new Error('Origin or destination coordinates are missing.');
        err.code = 'INVALID_COORDS';
        throw err;
    }

    const url =
        `${OSRM_BASE_URL}/route/v1/driving/` +
        `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
        `?overview=full&geometries=geojson&steps=true&annotations=false`;

    let res;
    try {
        res = await fetch(url, { signal: options.signal });
    } catch (networkErr) {
        if (networkErr?.name === 'AbortError') throw networkErr;
        const err = new Error('Could not connect to the routing service. Check your internet connection.');
        err.code = 'NETWORK';
        throw err;
    }

    if (!res.ok) {
        const err = new Error('Routing service returned an error. Please try again.');
        err.code = 'HTTP';
        throw err;
    }

    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
        const err = new Error(
            data.message ||
                'No driving route found between your location and the flower shop.'
        );
        err.code = data.code || 'NO_ROUTE';
        throw err;
    }

    const route = data.routes[0];
    // OSRM GeoJSON is [lng, lat]; Leaflet wants [lat, lng]
    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const steps = [];
    route.legs.forEach((leg) => {
        leg.steps.forEach((step) => {
            const { type, modifier, location } = step.maneuver;
            const { icon, label } = maneuverInfo(type, modifier);
            const distM = step.distance ?? 0;
            steps.push({
                icon,
                instruction: step.name ? `${label} onto ${step.name}` : label,
                name: step.name || '',
                distanceM: distM,
                distanceStr: formatDistance(distM),
                durationSec: step.duration ?? 0,
                type,
                modifier: modifier || null,
                location: location
                    ? { lat: location[1], lng: location[0] }
                    : null,
            });
        });
    });

    return {
        coords,
        steps,
        totalDist: route.distance,
        totalDuration: route.duration,
        distanceStr: formatDistance(route.distance),
        travelTimeStr: formatDuration(route.duration),
    };
}
