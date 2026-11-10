import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const shopIcon = new L.DivIcon({
    className: 'custom-shop-icon',
    html: `<div style="background-color: #E91E63; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const userIcon = new L.DivIcon({
    className: 'custom-user-icon',
    html: `<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function MapEvents({ onMapClick }) {
    useMapEvents({
        click(e) {
            if (onMapClick) onMapClick(e.latlng);
        }
    });
    return null;
}

function MapBounds({ userLocation, shopLocation, routeData }) {
    const map = useMap();
    useEffect(() => {
        const bounds = [];
        if (shopLocation && shopLocation.lat) bounds.push([shopLocation.lat, shopLocation.lng]);
        if (userLocation && userLocation.lat) bounds.push([userLocation.lat, userLocation.lng]);
        
        if (routeData && routeData.length > 0) {
            routeData.forEach(p => {
                if (Array.isArray(p)) bounds.push([p[0], p[1]]);
                else if (p.lat) bounds.push([p.lat, p.lng]);
            });
        }
        
        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [30, 30] });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 15);
        }
    }, [map, userLocation, shopLocation, routeData]);
    return null;
}

export default function RoutingMap({ userLocation, shopLocation, shopName, routeData, mode, onMapClick }) {
    if (!shopLocation || !shopLocation.lat) {
        return (
            <div className="w-full h-full bg-[#FAF0F3] flex flex-col items-center justify-center text-gray-500 text-sm p-4 text-center">
                <p>Location preview unavailable.</p>
            </div>
        );
    }

    const center = [shopLocation.lat, shopLocation.lng];
    const isPickup = mode === 'pickup';

    return (
        <MapContainer center={center} zoom={14} className="w-full h-full z-10" zoomControl={false}>
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
            />
            
            <MapEvents onMapClick={onMapClick} />
            <MapBounds userLocation={userLocation} shopLocation={shopLocation} routeData={routeData} />

            <Marker position={center} icon={shopIcon}>
                <Popup>
                    <div className="font-semibold text-gray-800">{shopName || 'Store Location'}</div>
                </Popup>
            </Marker>

            {!isPickup && userLocation && userLocation.lat && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>
                        <div className="font-semibold text-gray-800">Delivery Location</div>
                    </Popup>
                </Marker>
            )}

            {routeData && routeData.length > 0 && (
                <Polyline positions={routeData.map(p => Array.isArray(p) ? p : [p.lat, p.lng])} color="#E91E63" weight={4} opacity={0.8} />
            )}
        </MapContainer>
    );
}
