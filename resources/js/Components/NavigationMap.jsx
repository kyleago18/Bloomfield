import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const shopIcon = new L.DivIcon({
    className: 'custom-shop-icon',
    html: `<div style="background-color: #E91E63; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(233,30,99,0.5); display: flex; align-items: center; justify-content: center;">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const getDriverIcon = (heading = 0) => {
    return new L.DivIcon({
        className: 'custom-driver-icon',
        html: `<div style="background-color: #3B82F6; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(59,130,246,0.6); display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.3s ease;">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: translateY(-2px);"><polygon points="12 2 2 22 12 17 22 22 12 2"></polygon></svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

function NavigationController({ userLocation, shopLocation, routeData, followUser }) {
    const map = useMap();
    const lastUserPos = useRef(null);

    useEffect(() => {
        if (!map) return;

        if (followUser && userLocation && userLocation.lat) {
            // Keep map centered on user
            map.setView([userLocation.lat, userLocation.lng], 17, { animate: true, duration: 1 });
            lastUserPos.current = [userLocation.lat, userLocation.lng];
        } else if (!lastUserPos.current) {
            // Only set bounds once initially if not following
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
                map.fitBounds(bounds, { padding: [50, 50] });
                lastUserPos.current = true;
            } else if (bounds.length === 1) {
                map.setView(bounds[0], 15);
                lastUserPos.current = true;
            }
        }
    }, [map, userLocation, shopLocation, routeData, followUser]);

    return null;
}

export default function NavigationMap({ userLocation, shopLocation, routeData, heading, accuracy, followUser, navigationMode }) {
    if (!shopLocation || !shopLocation.lat) {
        return <div className="w-full h-full bg-[#111827] flex items-center justify-center text-white">Searching for GPS...</div>;
    }

    // Convert routeData to array of arrays if needed
    const polylinePositions = (routeData || []).map(p => Array.isArray(p) ? p : [p.lat, p.lng]);

    // Navigation mode uses a different tile style
    const tileUrl = navigationMode 
        ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    return (
        <MapContainer 
            center={[shopLocation.lat, shopLocation.lng]} 
            zoom={15} 
            className="w-full h-full z-10" 
            zoomControl={!navigationMode}
        >
            <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={19} />
            
            <NavigationController 
                userLocation={userLocation} 
                shopLocation={shopLocation} 
                routeData={routeData} 
                followUser={followUser} 
            />

            <Marker position={[shopLocation.lat, shopLocation.lng]} icon={shopIcon} />

            {userLocation && userLocation.lat && (
                <>
                    {accuracy && (
                        <Circle 
                            center={[userLocation.lat, userLocation.lng]} 
                            radius={accuracy} 
                            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 0 }} 
                        />
                    )}
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={getDriverIcon(heading)} />
                </>
            )}

            {polylinePositions.length > 0 && (
                <>
                    {/* Outline for better visibility on dark maps */}
                    <Polyline positions={polylinePositions} color={navigationMode ? "#000000" : "#ffffff"} weight={8} opacity={0.5} />
                    <Polyline positions={polylinePositions} color="#3B82F6" weight={5} opacity={0.9} />
                </>
            )}
        </MapContainer>
    );
}
