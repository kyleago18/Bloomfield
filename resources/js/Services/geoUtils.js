/**
 * Geospatial helpers for live navigation.
 */

const EARTH_RADIUS_M = 6371000;

/** Haversine distance in meters between two {lat,lng} points */
export function haversineDistance(a, b) {
    if (!a || !b || !isValidCoord(a) || !isValidCoord(b)) return Infinity;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h =
        sinDLat * sinDLat +
        Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

    return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Bearing in degrees (0–360) from point a to point b */
export function bearing(a, b) {
    if (!a || !b) return 0;

    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** True if coordinates look usable for routing / map display */
export function isValidCoord(point) {
    if (!point) return false;
    const lat = Number(point.lat);
    const lng = Number(point.lng);
    return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        !(lat === 0 && lng === 0)
    );
}

/** Normalize various coord shapes into { lat, lng } or null */
export function toLatLng(point) {
    if (!point) return null;
    const lat = Number(point.lat ?? point.latitude);
    const lng = Number(point.lng ?? point.longitude);
    const normalized = { lat, lng };
    return isValidCoord(normalized) ? normalized : null;
}

/** Closest polyline vertex index to a position */
export function closestPointIndex(routeCoords, pos) {
    let minDist = Infinity;
    let idx = 0;

    for (let i = 0; i < routeCoords.length; i++) {
        const [lat, lng] = routeCoords[i];
        const d = haversineDistance(pos, { lat, lng });
        if (d < minDist) {
            minDist = d;
            idx = i;
        }
    }

    return { idx, minDist };
}

/** Remaining distance (meters) along polyline from startIdx to end */
export function remainingDistanceAlongRoute(routeCoords, startIdx) {
    let dist = 0;
    for (let i = startIdx; i < routeCoords.length - 1; i++) {
        const [la, lna] = routeCoords[i];
        const [lb, lnb] = routeCoords[i + 1];
        dist += haversineDistance({ lat: la, lng: lna }, { lat: lb, lng: lnb });
    }
    return dist;
}

/** Progress 0–1 along the full route based on remaining meters */
export function routeProgress(totalDistM, remainingDistM) {
    if (!totalDistM || totalDistM <= 0) return 0;
    const done = Math.max(0, totalDistM - Math.max(0, remainingDistM));
    return Math.min(1, done / totalDistM);
}

/** Format meters → "1.25 km" / "340 m" */
export function formatDistance(meters) {
    if (meters == null || !Number.isFinite(meters)) return '—';
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
}

/** Format meters → kilometers number string for UI that specifically wants km */
export function formatDistanceKm(meters) {
    if (meters == null || !Number.isFinite(meters)) return '—';
    return `${(Math.max(0, meters) / 1000).toFixed(2)} km`;
}

/** Format seconds → "12 min" / "1h 5min" */
export function formatDuration(seconds) {
    if (seconds == null || !Number.isFinite(seconds)) return '—';
    const mins = Math.max(0, Math.round(seconds / 60));
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/** Estimated arrival clock time from remaining seconds */
export function formatEtaClock(remainingSeconds) {
    if (remainingSeconds == null || !Number.isFinite(remainingSeconds)) return '—';
    const eta = new Date(Date.now() + remainingSeconds * 1000);
    return eta.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function toRad(deg) {
    return (deg * Math.PI) / 180;
}

function toDeg(rad) {
    return (rad * 180) / Math.PI;
}
