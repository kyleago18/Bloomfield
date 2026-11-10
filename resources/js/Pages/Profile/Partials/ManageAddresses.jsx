import { router, useForm } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import AddressDropdowns from '@/Components/AddressDropdowns';
import { MapPin, Plus, Trash2, Edit2, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const PSGC_API = 'https://psgc.gitlab.io/api';

const safeMatch = (list, query) => {
    if (!query) return null;
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const q = norm(query);
    return list.find(item => norm(item.name) === q || norm(item.name).includes(q) || q.includes(norm(item.name)));
};

function MapUpdater({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 15);
    }, [position, map]);
    return null;
}

function LocationPicker({ position, setPosition, onLocationSelected }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            onLocationSelected(lat, lng);
        },
    });
    return position ? <Marker position={position} /> : null;
}

export default function ManageAddresses({ addresses }) {
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(!addresses || addresses.length === 0);
    const [isLocating, setIsLocating] = useState(false);
    const [mapPosition, setMapPosition] = useState([6.7483, 125.3551]); // Davao del Sur center
    const form = useForm({
        province: 'Davao del Sur',
        city: '',
        barangay: '',
        street: '',
        landmark: '',
        phone_number: '',
        latitude: '',
        longitude: '',
        is_default: false,
    });

    const resetForm = () => {
        form.reset();
        setEditingId(null);
        if (addresses && addresses.length > 0) {
            setShowForm(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            form.put(route('addresses.update', editingId), { 
                preserveState: true,
                preserveScroll: true,
                onSuccess: resetForm 
            });
            return;
        }
        form.post(route('addresses.store'), { 
            preserveState: true,
            preserveScroll: true,
            onSuccess: resetForm 
        });
    };

    const editAddress = (address) => {
        setEditingId(address.id);
        setShowForm(true);
        
        if (address.latitude && address.longitude) {
            setMapPosition([parseFloat(address.latitude), parseFloat(address.longitude)]);
        }

        form.setData({
            province: address.province ?? 'Davao del Sur',
            city: address.city ?? '',
            barangay: address.barangay ?? '',
            street: address.street ?? '',
            landmark: address.landmark ?? '',
            phone_number: address.phone_number ?? '',
            latitude: address.latitude ?? '',
            longitude: address.longitude ?? '',
            is_default: Boolean(address.is_default),
        });
    };

    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
                { headers: { 'User-Agent': 'BloomAndGlow-Address/1.0' } }
            );
            const data = await res.json();
            if (!data.address) return;

            const addr = data.address;
            const osmCity = addr.city || addr.town || addr.municipality || '';
            const osmBarangay = addr.suburb || addr.village || addr.quarter || addr.neighbourhood || '';
            const osmStreet = [addr.house_number, addr.road].filter(Boolean).join(' ');

            let targetCityName = osmCity;
            let targetBarangayName = osmBarangay;

            try {
                const cityRes = await fetch(`${PSGC_API}/provinces/112400000/cities-municipalities/`);
                const cityList = await cityRes.json();
                const matchedCity = safeMatch(cityList, osmCity);
                if (matchedCity) {
                    targetCityName = matchedCity.name;
                    const brgyRes = await fetch(`${PSGC_API}/cities-municipalities/${matchedCity.code}/barangays/`);
                    const brgyList = await brgyRes.json();
                    const matchedBrgy = safeMatch(brgyList, osmBarangay);
                    if (matchedBrgy) {
                        targetBarangayName = matchedBrgy.name;
                    }
                }
            } catch (e) {
                console.error("PSGC fetch failed during reverse geocode", e);
            }

            form.setData(prev => ({
                ...prev,
                city: targetCityName || prev.city,
                barangay: targetBarangayName || prev.barangay,
                street: osmStreet || prev.street,
                latitude: lat.toString(),
                longitude: lng.toString()
            }));
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
        }
    }, [form]);

    const handleAutoLocate = useCallback(() => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setMapPosition([lat, lng]);
                form.setData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
                await reverseGeocode(lat, lng);
                setIsLocating(false);
            },
            () => {
                alert('Unable to retrieve your location. Please check browser permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [reverseGeocode, form]);

    const remove = (id) => {
        if (confirm('Remove this address?')) {
            router.delete(route('addresses.destroy', id));
        }
    };

    const inputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-2.5 font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none border-none transition-all";

    return (
        <div className="space-y-6">
            <header className="border-b border-pink-200/40 pb-4 flex justify-between items-end">
                <div>
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-800 tracking-tight flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#E91E63] stroke-[1.8]" />
                        Saved Addresses
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500 font-normal">
                        Manage your delivery addresses. Save multiple locations for quicker checkout.
                    </p>
                </div>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => {
                            form.reset();
                            setEditingId(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white shadow-sm border border-pink-200 text-[#E91E63] text-xs font-bold uppercase tracking-wider hover:bg-pink-50 transition-all"
                    >
                        <Plus className="w-4 h-4 stroke-[2]" />
                        Add New
                    </button>
                )}
            </header>

            {/* Address Input Form */}
            {showForm && (
                <form onSubmit={submit} className="space-y-4 bg-[#FAF0F3] p-5 rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] border border-white/60">
                    {/* Map & Auto-Locate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                            onClick={handleAutoLocate}
                            disabled={isLocating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm border border-pink-200 text-[#E91E63] text-[10px] font-bold uppercase tracking-wider hover:bg-pink-50 transition-all disabled:opacity-50"
                        >
                            {isLocating ? (
                                <svg className="animate-spin w-3 h-3 text-[#E91E63]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <Navigation className="w-3 h-3 stroke-[2]" />
                            )}
                            {isLocating ? 'Locating...' : 'Use My Location'}
                        </button>
                    </div>
                    
                    <div className="h-[250px] rounded-xl overflow-hidden shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] border-4 border-white">
                        <MapContainer center={mapPosition} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                            <TileLayer
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                maxZoom={19}
                            />
                            <LocationPicker 
                                position={mapPosition} 
                                setPosition={setMapPosition}
                                onLocationSelected={async (lat, lng) => {
                                    form.setData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
                                    await reverseGeocode(lat, lng);
                                }}
                            />
                            <MapUpdater position={mapPosition} />
                        </MapContainer>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Click on the map to pin your address automatically.</p>
                </div>

                <AddressDropdowns
                    provinceValue={form.data.province}
                    cityValue={form.data.city}
                    barangayValue={form.data.barangay}
                    onProvinceChange={(val) => form.setData('province', val)}
                    onCityChange={(val) => form.setData('city', val)}
                    onBarangayChange={(val) => form.setData('barangay', val)}
                    variant="neumorphic"
                />

                <div className="grid gap-3 md:grid-cols-2">
                    <input className={inputStyle} placeholder="Street / Purok / Subd." value={form.data.street} onChange={(e) => form.setData('street', e.target.value)} />
                    <input className={inputStyle} placeholder="Landmark (Near church, school, etc.)" value={form.data.landmark} onChange={(e) => form.setData('landmark', e.target.value)} />
                    <input className={`${inputStyle} md:col-span-2`} placeholder="Phone Number (e.g. 09123456789)" type="tel" value={form.data.phone_number} onChange={(e) => form.setData('phone_number', e.target.value)} />
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none pt-1">
                    <input type="checkbox" checked={form.data.is_default} onChange={(e) => form.setData('is_default', e.target.checked)} className="rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] w-3.5 h-3.5" />
                    Set as default address
                </label>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={form.processing} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-xs font-semibold uppercase tracking-wider shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all disabled:opacity-50">
                        {editingId ? 'Update Address' : 'Save Address'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-full bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-600 hover:text-[#E91E63] text-xs font-semibold uppercase tracking-wider transition-all">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            )}

            {/* Saved Address Cards */}
            <div className="space-y-4 pt-2">
                {addresses && addresses.length > 0 ? (
                    addresses.map((address) => (
                        <div key={address.id} className="rounded-2xl border border-white/80 bg-[#FAF0F3] p-5 shadow-[4px_4px_12px_#e2d7da,-4px_-4px_12px_#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-xs sm:text-sm text-gray-800">Delivery Address</p>
                                    {address.is_default && (
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 font-normal leading-relaxed">
                                    {[address.street, address.barangay, address.city, address.province].filter(Boolean).join(', ')}
                                </p>
                                {address.landmark && <p className="text-[10px] text-gray-400 font-medium">Landmark: {address.landmark}</p>}
                                {address.phone_number && <p className="text-[10px] text-gray-400 font-medium">Phone: {address.phone_number}</p>}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button type="button" onClick={() => editAddress(address)} className="p-2 rounded-xl bg-[#FAF0F3] shadow-[3px_3px_6px_#e2d7da,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-[#E91E63] transition-all">
                                    <Edit2 className="w-4 h-4 stroke-[1.8]" />
                                </button>
                                <button type="button" onClick={() => remove(address.id)} className="p-2 rounded-xl bg-[#FAF0F3] shadow-[3px_3px_6px_#e2d7da,-3px_-3px_6px_#ffffff] text-rose-500 hover:text-rose-700 transition-all">
                                    <Trash2 className="w-4 h-4 stroke-[1.8]" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-500 italic font-normal">No saved addresses found.</p>
                )}
            </div>
        </div>
    );
}
