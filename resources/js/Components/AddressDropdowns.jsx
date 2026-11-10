import React, { useState, useEffect } from 'react';

const PSGC_API = 'https://psgc.gitlab.io/api';

export default function AddressDropdowns({
    provinceValue = '',
    cityValue = '',
    barangayValue = '',
    onProvinceChange,
    onCityChange,
    onBarangayChange,
    variant = 'neumorphic', // 'neumorphic' | 'floating' | 'standard'
    errors = {},
}) {
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const selectedProvCode = '112400000'; // Davao del Sur
    const [selectedCityCode, setSelectedCityCode] = useState('');
    const [selectedBrgyCode, setSelectedBrgyCode] = useState('');

    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);

    // Call onProvinceChange once on mount
    useEffect(() => {
        onProvinceChange('Davao del Sur');
    }, []);

    // 1. Fetch Cities for Davao del Sur
    useEffect(() => {
        let isMounted = true;
        setLoadingCities(true);
        fetch(`${PSGC_API}/provinces/${selectedProvCode}/cities-municipalities/`)
            .then((res) => res.json())
            .then((data) => {
                if (!isMounted) return;
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
                setCities(sorted);

                if (cityValue) {
                    const match = sorted.find(
                        (c) => c.name.toLowerCase() === cityValue.toLowerCase()
                    );
                    if (match) {
                        setSelectedCityCode(match.code);
                    }
                }
            })
            .catch(() => {})
            .finally(() => {
                if (isMounted) setLoadingCities(false);
            });
        return () => {
            isMounted = false;
        };
    }, [selectedProvCode]);

    // 3. Fetch Barangays when City changes
    useEffect(() => {
        let isMounted = true;
        if (!selectedCityCode) {
            setBarangays([]);
            return;
        }
        setLoadingBarangays(true);
        fetch(`${PSGC_API}/cities-municipalities/${selectedCityCode}/barangays/`)
            .then((res) => res.json())
            .then((data) => {
                if (!isMounted) return;
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
                setBarangays(sorted);

                if (barangayValue) {
                    const match = sorted.find(
                        (b) => b.name.toLowerCase() === barangayValue.toLowerCase()
                    );
                    if (match) {
                        setSelectedBrgyCode(match.code);
                    }
                }
            })
            .catch(() => {})
            .finally(() => {
                if (isMounted) setLoadingBarangays(false);
            });
        return () => {
            isMounted = false;
        };
    }, [selectedCityCode]);

    // 4. Sync external cityValue changes (e.g. from Auto-Locate reverse geocoding)
    useEffect(() => {
        if (cityValue && cities.length > 0) {
            const match = cities.find((c) => c.name.toLowerCase() === cityValue.toLowerCase());
            if (match && match.code !== selectedCityCode) {
                setSelectedCityCode(match.code);
            }
        } else if (!cityValue && selectedCityCode) {
            setSelectedCityCode('');
        }
    }, [cityValue, cities]);

    // 5. Sync external barangayValue changes
    useEffect(() => {
        if (barangayValue && barangays.length > 0) {
            const match = barangays.find((b) => b.name.toLowerCase() === barangayValue.toLowerCase());
            if (match && match.code !== selectedBrgyCode) {
                setSelectedBrgyCode(match.code);
            }
        } else if (!barangayValue && selectedBrgyCode) {
            setSelectedBrgyCode('');
        }
    }, [barangayValue, barangays]);

    const handleCityChange = (e) => {
        const code = e.target.value;
        setSelectedCityCode(code);
        setSelectedBrgyCode('');

        const cityObj = cities.find((c) => c.code === code);
        const name = cityObj ? cityObj.name : '';
        onCityChange(name);
        onBarangayChange('');
    };

    const handleBrgyChange = (e) => {
        const code = e.target.value;
        setSelectedBrgyCode(code);

        const brgyObj = barangays.find((b) => b.code === code);
        const name = brgyObj ? brgyObj.name : '';
        onBarangayChange(name);
    };

    const selectStyleNeumorphic = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-3 font-medium text-gray-800 focus:outline-none border-none cursor-pointer disabled:opacity-50 transition-all";
    const labelStyleNeumorphic = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5";

    if (variant === 'neumorphic') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fixed Province */}
                    <div>
                        <label className={labelStyleNeumorphic}>Province</label>
                        <div className="w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-3 font-semibold text-gray-500 border border-white/60 select-none">
                            Davao del Sur
                        </div>
                    </div>

                    {/* City Dropdown */}
                    <div>
                        <label className={labelStyleNeumorphic}>City / Municipality</label>
                        <select
                            value={selectedCityCode}
                            onChange={handleCityChange}
                            disabled={loadingCities || !selectedProvCode}
                            className={selectStyleNeumorphic}
                        >
                            <option value="">
                                {loadingCities
                                    ? 'Loading Cities...'
                                    : !selectedProvCode
                                    ? 'Select Province First'
                                    : 'Select City'}
                            </option>
                            {cities.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Barangay Dropdown */}
                <div>
                    <label className={labelStyleNeumorphic}>Barangay</label>
                    <select
                        value={selectedBrgyCode}
                        onChange={handleBrgyChange}
                        disabled={loadingBarangays || !selectedCityCode}
                        className={selectStyleNeumorphic}
                    >
                        <option value="">
                            {loadingBarangays
                                ? 'Loading Barangays...'
                                : !selectedCityCode
                                ? 'Select City First'
                                : 'Select Barangay'}
                        </option>
                        {barangays.map((b) => (
                            <option key={b.code} value={b.code}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    if (variant === 'floating') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fixed Province */}
                    <div className="relative group">
                        <div className="block w-full px-4 pt-6 pb-2 text-sm font-semibold text-gray-500 bg-[#FAF0F3] rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] border border-white/60 select-none">
                            Davao del Sur
                        </div>
                        <label className="absolute text-xs text-gray-500 duration-300 transform -translate-y-3 scale-90 top-4 z-10 origin-[0] left-4 pointer-events-none font-bold">
                            Province
                        </label>
                    </div>

                    {/* City Dropdown */}
                    <div className="relative group">
                        <select
                            id="city"
                            value={selectedCityCode}
                            onChange={handleCityChange}
                            disabled={loadingCities || !selectedProvCode}
                            className="block w-full px-4 pt-6 pb-2 text-sm text-gray-800 bg-[#FAF0F3] rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] border-none focus:outline-none transition-all duration-300 cursor-pointer disabled:opacity-60"
                        >
                            <option value="">
                                {loadingCities
                                    ? 'Loading Cities...'
                                    : !selectedProvCode
                                    ? 'Select Province First'
                                    : 'Select City / Municipality'}
                            </option>
                            {cities.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <label
                            htmlFor="city"
                            className="absolute text-xs text-gray-500 duration-300 transform -translate-y-3 scale-90 top-4 z-10 origin-[0] left-4 pointer-events-none font-semibold"
                        >
                            City / Municipality
                        </label>
                    </div>
                </div>

                {/* Barangay Dropdown */}
                <div className="relative group">
                    <select
                        id="barangay"
                        value={selectedBrgyCode}
                        onChange={handleBrgyChange}
                        disabled={loadingBarangays || !selectedCityCode}
                        className="block w-full px-4 pt-6 pb-2 text-sm text-gray-800 bg-[#FAF0F3] rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] border-none focus:outline-none transition-all duration-300 cursor-pointer disabled:opacity-60"
                    >
                        <option value="">
                            {loadingBarangays
                                ? 'Loading Barangays...'
                                : !selectedCityCode
                                ? 'Select City First'
                                : 'Select Barangay'}
                        </option>
                        {barangays.map((b) => (
                            <option key={b.code} value={b.code}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <label
                        htmlFor="barangay"
                        className="absolute text-xs text-gray-500 duration-300 transform -translate-y-3 scale-90 top-4 z-10 origin-[0] left-4 pointer-events-none font-semibold"
                    >
                        Barangay
                    </label>
                </div>
            </div>
        );
    }

    // Standard Layout
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Fixed Province */}
                <div>
                    <label className={labelStyleNeumorphic}>Province</label>
                    <div className="w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-3 font-semibold text-gray-500 border border-white/60 select-none">
                        Davao del Sur
                    </div>
                </div>

                {/* City Dropdown */}
                <div>
                    <label className={labelStyleNeumorphic}>City / Municipality</label>
                    <select
                        value={selectedCityCode}
                        onChange={handleCityChange}
                        disabled={loadingCities || !selectedProvCode}
                        className={selectStyleNeumorphic}
                    >
                        <option value="">
                            {loadingCities
                                ? 'Loading Cities...'
                                : !selectedProvCode
                                ? 'Select Province First'
                                : 'Select City'}
                        </option>
                        {cities.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Barangay Dropdown */}
                <div>
                    <label className={labelStyleNeumorphic}>Barangay</label>
                    <select
                        value={selectedBrgyCode}
                        onChange={handleBrgyChange}
                        disabled={loadingBarangays || !selectedCityCode}
                        className={selectStyleNeumorphic}
                    >
                        <option value="">
                            {loadingBarangays
                                ? 'Loading Barangays...'
                                : !selectedCityCode
                                ? 'Select City First'
                                : 'Select Barangay'}
                        </option>
                        {barangays.map((b) => (
                            <option key={b.code} value={b.code}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
