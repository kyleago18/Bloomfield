import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Head, Link, router } from '@inertiajs/react';
import { ADD_ONS } from '../utils/eprio';
import { useCart } from '../Contexts/CartContext';
import { getProductImage } from '../utils/productImages';
import { fetchDrivingRoute } from '../Services/osrmService';
import StoreHeader from '../Components/StoreHeader';
import CartDrawer from '../Components/CartDrawer';
import RoutingMap from '../Components/RoutingMap';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Navigation, Sparkles, Clock, CreditCard, ShoppingBag, User, Truck, Calendar, Store, AlertCircle, Lock } from 'lucide-react';

// ── PSGC API base ───────────────────────────────────────────────────
const PSGC_API = 'https://psgc.gitlab.io/api';

const TIME_OPTIONS = [
    'Select Time',
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM', '6:00 PM',
];

// ADD_ONS imported from utils/eprio.js

export default function Checkout({ auth, lastOrder, lastDelivery, userAddresses }) {
    const { cartItems, cartSubtotal, cartCount, clearCart, updateQuantity, removeFromCart, selectedAddOns } = useCart();
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Buy Now State
    const [buyNowItem, setBuyNowItem] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('buy_now') === '1') {
            const stored = localStorage.getItem('buy_now_item');
            if (stored) {
                try {
                    setBuyNowItem(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse buy_now_item:', e);
                }
            }
        }
    }, []);

    const isBuyNow = !!buyNowItem;
    const checkoutItems = isBuyNow ? [buyNowItem] : cartItems;
    const checkoutSubtotal = isBuyNow ? (Number(buyNowItem.price) * Number(buyNowItem.quantity)) : cartSubtotal;
    const checkoutCount = isBuyNow ? Number(buyNowItem.quantity) : cartCount;

    const updateBuyNowQuantity = (amount) => {
        if (!buyNowItem) return;
        const newQty = Math.max(1, Math.min(buyNowItem.stock || 99, buyNowItem.quantity + amount));
        const updated = { ...buyNowItem, quantity: newQty };
        setBuyNowItem(updated);
        localStorage.setItem('buy_now_item', JSON.stringify(updated));
    };

    const removeBuyNowItem = () => {
        setBuyNowItem(null);
        localStorage.removeItem('buy_now_item');
        router.visit('/flowers');
    };

    // ── Form State ──
    const defaultAddress = userAddresses?.find(a => a.is_default) || (userAddresses?.length > 0 ? userAddresses[0] : null);

    const [customer, setCustomer] = useState({ 
        firstName: auth?.user?.name?.split(' ')[0] || '', 
        lastName: auth?.user?.name?.split(' ').slice(1).join(' ') || '', 
        contact: defaultAddress?.phone_number || auth?.user?.phone || '', 
        email: auth?.user?.email || '' 
    });

    const [receiver, setReceiver] = useState({ 
        firstName: lastOrder?.receiver_first_name || '', 
        lastName: lastOrder?.receiver_last_name || '', 
        contact: defaultAddress?.phone_number || lastOrder?.receiver_contact || '', 
        email: lastOrder?.receiver_email || '' 
    });
    const [sameAsSender, setSameAsSender] = useState(true);

    const initialAddress = {
        regionCode: '110000000', regionName: 'Davao Region',
        provinceCode: '112400000', provinceName: 'Davao del Sur',
        cityCode: '', cityName: '',
        barangayCode: '', barangayName: '',
        street: '',
        landmark: '',
    };

    const hasValidAddress = !!(initialAddress.cityName && initialAddress.barangayName && initialAddress.street);

    const [deliveryMethod, setDeliveryMethod] = useState(lastOrder?.delivery_method || 'delivery'); // 'delivery' | 'pickup'
    const [isEditingAddress, setIsEditingAddress] = useState(!hasValidAddress);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [address, setAddress] = useState(initialAddress);

    // Helper for matching strings to PSGC
    const safeMatch = useCallback((list, searchStr) => {
        if (!searchStr || !list) return null;
        const lowerSearch = searchStr.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!lowerSearch) return null;
        return list.find(item => {
            const lowerItem = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return lowerItem.includes(lowerSearch) || lowerSearch.includes(lowerItem);
        });
    }, []);

    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [routeError, setRouteError] = useState(null);
    const skipForwardGeocode = useRef(false);

    // ── Payment State ──
    const [paymentError, setPaymentError] = useState(null);

    // ── Route Navigation State ──
    const [routeData, setRouteData] = useState(null);
    const [routeMeta, setRouteMeta] = useState(null);

    // Dynamic Shop Coordinates loaded from cart item / seller relationship
    const shopName = checkoutItems.length > 0 ? (checkoutItems[0].shop_name || checkoutItems[0].seller?.shop_name || 'Bloom&Glow Store') : 'Bloom&Glow Store';
    const shopAddress = checkoutItems[0]?.seller_address || checkoutItems[0]?.seller?.address || 'Main Storefront, Hagonoy, Davao del Sur';

    const sellerLat = Number(checkoutItems[0]?.seller_latitude || checkoutItems[0]?.seller?.latitude || checkoutItems[0]?.shop_latitude || 6.7508);
    const sellerLng = Number(checkoutItems[0]?.seller_longitude || checkoutItems[0]?.seller?.longitude || checkoutItems[0]?.shop_longitude || 125.3571);

    const shopLocation = useMemo(() => ({
        lat: sellerLat,
        lng: sellerLng,
    }), [sellerLat, sellerLng]);

    const effectiveUserLocation = deliveryLocation;

    // Calculate OSRM Driving Route based on fulfillment method
    useEffect(() => {
        let isMounted = true;
        const calculateRoute = async () => {
            setRouteError(null);
            try {
                let startPos, endPos;
                if (deliveryMethod === 'pickup') {
                    // Pickup: Customer -> Shop
                    startPos = effectiveUserLocation;
                    endPos = shopLocation;
                } else {
                    // Delivery: Shop -> Customer Delivery Address
                    startPos = shopLocation;
                    endPos = effectiveUserLocation;
                }

                if (startPos && endPos) {
                    const res = await fetchDrivingRoute(startPos, endPos);
                    if (!isMounted) return;
                    setRouteData(res.coords);
                    setRouteMeta({ distance: res.distanceStr, duration: res.travelTimeStr, totalDist: res.totalDist });
                }
            } catch (err) {
                if (!isMounted) return;
                console.error('Checkout route calculation error:', err);
                
                if (effectiveUserLocation && shopLocation) {
                    const toRad = (value) => (value * Math.PI) / 180;
                    const R = 6371e3; // Earth radius in meters
                    const dLat = toRad(effectiveUserLocation.lat - shopLocation.lat);
                    const dLon = toRad(effectiveUserLocation.lng - shopLocation.lng);
                    const lat1 = toRad(shopLocation.lat);
                    const lat2 = toRad(effectiveUserLocation.lat);

                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                    const fallbackDist = R * c; // in meters

                    setRouteData(null); // No route line to draw
                    setRouteMeta({ 
                        distance: (fallbackDist / 1000).toFixed(1) + ' km (Straight-line)', 
                        duration: 'N/A (Ferry/Flight required)', 
                        totalDist: fallbackDist 
                    });
                    
                    setRouteError('Unable to calculate driving route (e.g., crossing sea). Using straight-line distance instead.');
                } else {
                    setRouteData(null);
                    setRouteMeta(null);
                }
            }
        };

        calculateRoute();
        return () => { isMounted = false; };
    }, [deliveryMethod, effectiveUserLocation, shopLocation]);

    const [schedule, setSchedule] = useState({ 
        date: new Date().toISOString().split('T')[0], 
        time: '12:00 PM' 
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [specialRequests, setSpecialRequests] = useState({ addOns: selectedAddOns || [], note: '' });
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const isOnlinePayment = paymentMethod === 'stripe' || paymentMethod === 'online_payment';

    // Reset error if method changes
    useEffect(() => {
        setPaymentError(null);
    }, [paymentMethod]);

    // ── PSGC Dropdown Data ──
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [loadingCities, setLoadingCities] = useState(true);
    const [loadingBarangays, setLoadingBarangays] = useState(false);

    // ── Derived ──
    const shippingFee = useMemo(() => {
        if (deliveryMethod === 'pickup') return 0;
        if (!routeMeta || routeMeta.totalDist == null) return 75;
        
        const distKm = routeMeta.totalDist / 1000;
        if (distKm <= 3) return 75;
        
        const additionalKm = Math.ceil(distKm - 3);
        return 75 + (additionalKm * 25);
    }, [deliveryMethod, routeMeta]);

    const addOnTotal = useMemo(() => {
        return specialRequests.addOns.reduce((sum, addOnId) => {
            const addOn = ADD_ONS.find(a => a.id === addOnId);
            return sum + (addOn ? addOn.price : 0);
        }, 0);
    }, [specialRequests.addOns]);

    const total = checkoutSubtotal + shippingFee + addOnTotal;

    // ── Same-as-sender toggle ──
    useEffect(() => {
        if (sameAsSender) {
            setReceiver({ ...customer });
        }
    }, [sameAsSender, customer]);

    // ═══════════════════ PSGC CASCADING FETCHES ═══════════════════════

    useEffect(() => {
        setLoadingCities(true);
        fetch(`${PSGC_API}/provinces/112400000/cities-municipalities/`)
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
                setCities(sorted);
            })
            .catch(() => setCities([]))
            .finally(() => setLoadingCities(false));
    }, [address.provinceCode]);

    useEffect(() => {
        if (!address.cityCode) { setBarangays([]); return; }
        setLoadingBarangays(true);
        setBarangays([]);
        fetch(`${PSGC_API}/cities-municipalities/${address.cityCode}/barangays/`)
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
                setBarangays(sorted);
            })
            .catch(() => setBarangays([]))
            .finally(() => setLoadingBarangays(false));
    }, [address.cityCode]);

    // ── Cascading address handlers ──
    const handleCityChange = (code) => {
        skipForwardGeocode.current = false;
        const city = cities.find(c => c.code === code);
        setAddress(prev => ({
            ...prev,
            cityCode: code, cityName: city?.name || '',
            barangayCode: '', barangayName: '',
        }));
    };

    const handleBarangayChange = (code) => {
        skipForwardGeocode.current = false;
        const brgy = barangays.find(b => b.code === code);
        setAddress(prev => ({
            ...prev,
            barangayCode: code, barangayName: brgy?.name || '',
        }));
    };

    const toggleAddOn = (id) => {
        setSpecialRequests(prev => ({
            ...prev,
            addOns: prev.addOns.includes(id)
                ? prev.addOns.filter(a => a !== id)
                : [...prev.addOns, id],
        }));
    };

    // ═══════════════════ FORWARD GEOCODING (NOMINATIM) ════════════════

    useEffect(() => {
        if (deliveryMethod !== 'delivery') return;
        if (skipForwardGeocode.current) return;
        if (!address.regionName || !address.provinceName || !address.cityName) return;

        const timeoutId = setTimeout(async () => {
            const queriesToTry = [];
            
            // 1. Most specific
            if (address.street && address.barangayName) {
                queriesToTry.push(`${address.street}, ${address.barangayName}, ${address.cityName}, ${address.provinceName}, Philippines`);
            }
            // 2. No street
            if (address.barangayName) {
                queriesToTry.push(`${address.barangayName}, ${address.cityName}, ${address.provinceName}, Philippines`);
            }
            // 3. Just city & province
            queriesToTry.push(`${address.cityName}, ${address.provinceName}, Philippines`);

            let found = false;

            for (const qStr of queriesToTry) {
                if (found) break;
                
                try {
                    const q = encodeURIComponent(qStr);
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
                        headers: { 'User-Agent': 'BloomAndGlow-Checkout/1.0' }
                    });
                    const data = await res.json();
                    
                    if (data && data.length > 0) {
                        setDeliveryLocation({
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                        });
                        found = true;
                    }
                } catch (err) {
                    console.error('Forward geocoding failed for:', qStr, err);
                }
            }
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [address, deliveryMethod]);

    // ═══════════════════ REVERSE GEOCODING (NOMINATIM) ════════════════

    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
                { headers: { 'User-Agent': 'BloomAndGlow-Checkout/1.0' } }
            );
            const data = await res.json();
            if (!data.address) return;

            const addr = data.address;
            const osmRegion = addr.region || '';
            const osmProvince = addr.state || addr.county || addr.state_district || '';
            const osmCity = addr.city || addr.town || addr.municipality || '';
            const possibleBarangays = [addr.village, addr.suburb, addr.neighbourhood, addr.quarter].filter(Boolean);
            const osmStreet = [addr.house_number, addr.road].filter(Boolean).join(' ');

            let targetCityCode = '';
            let targetCityName = osmCity;
            let targetBarangayCode = '';
            let targetBarangayName = possibleBarangays.length > 0 ? possibleBarangays[0] : '';

            try {
                const cityRes = await fetch(`${PSGC_API}/provinces/112400000/cities-municipalities/`);
                const cityList = await cityRes.json();
                const matchedCity = safeMatch(cityList, osmCity);
                if (matchedCity) {
                    targetCityCode = matchedCity.code;
                    targetCityName = matchedCity.name;
                    const brgyRes = await fetch(`${PSGC_API}/cities-municipalities/${targetCityCode}/barangays/`);
                    const brgyList = await brgyRes.json();
                    
                    for (const candidate of possibleBarangays) {
                        const matchedBrgy = safeMatch(brgyList, candidate);
                        if (matchedBrgy) {
                            targetBarangayCode = matchedBrgy.code;
                            targetBarangayName = matchedBrgy.name;
                            break;
                        }
                    }
                }
            } catch (e) {
                console.error("PSGC fetch failed during reverse geocode", e);
            }

            setAddress(prev => ({
                ...prev,
                cityCode: targetCityCode, cityName: targetCityName,
                barangayCode: targetBarangayCode, barangayName: targetBarangayName,
                street: osmStreet || prev.street,
            }));
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
        }
    }, [address.regionCode, address.regionName]);

    const handleAutoLocate = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                skipForwardGeocode.current = true;
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setDeliveryLocation(coords);
                await reverseGeocode(coords.lat, coords.lng);
                setIsLocating(false);
            },
            () => {
                toast.error('Unable to retrieve your location. Please check your browser permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [reverseGeocode]);

    const handleSaveAddress = async () => {
        setIsSavingAddress(true);
        try {
            const payload = {
                province: address.provinceName,
                city: address.cityName,
                barangay: address.barangayName,
                street: address.street,
                landmark: address.landmark,
                latitude: deliveryLocation?.lat || null,
                longitude: deliveryLocation?.lng || null,
            };
            
            if (defaultAddress?.id) {
                await axios.put(`/account/addresses/${defaultAddress.id}`, payload);
                toast.success('Profile address updated successfully!');
            } else {
                payload.is_default = true;
                await axios.post('/account/addresses', payload);
                toast.success('Address saved to profile!');
            }
            setIsEditingAddress(false);
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error('Failed to save address. Please try again.');
        } finally {
            setIsSavingAddress(false);
        }
    };

    // ── Submit Order ──
    const handlePlaceOrder = async () => {
        if (!agreedToTerms) {
            toast.error('Please agree to the Terms of Service & Privacy Policy.');
            return;
        }
        if (checkoutItems.length === 0) {
            toast.error('Your checkout is empty.');
            return;
        }

        setIsSubmitting(true);
        setPaymentError(null);
        setErrors({});

        try {
            const payload = {
                cartItems: checkoutItems,
                customer,
                receiver,
                deliveryMethod,
                address: deliveryMethod === 'delivery' ? {
                    region: address.regionName,
                    province: address.provinceName,
                    city: address.cityName,
                    barangay: address.barangayName,
                    street: address.street,
                    landmark: address.landmark,
                } : {},
                deliveryLocation: effectiveUserLocation,
                schedule,
                paymentMethod,
                specialRequests,
                shippingFee: shippingFee,
            };

            if (isOnlinePayment) {
                // Stripe Hosted Checkout — redirect to Stripe
                const res = await axios.post('/checkout/create-session', payload);
                if (res.data?.checkout_url) {
                    if (isBuyNow) {
                        localStorage.removeItem('buy_now_item');
                    } else {
                        clearCart();
                    }
                    window.location.href = res.data.checkout_url; // hard redirect to Stripe
                    return;
                } else {
                    setPaymentError('Failed to create payment session. Please try again.');
                }
            } else {
                // COD — submit directly
                const response = await axios.post('/checkout', payload);
                if (response.status === 200 && (response.data?.url || response.data?.orderId)) {
                    if (isBuyNow) {
                        localStorage.removeItem('buy_now_item');
                    } else {
                        clearCart();
                    }
                    const targetUrl = response.data.url || `/checkout/success?order_id=${response.data.orderId}`;
                    router.visit(targetUrl);
                } else if (response.status === 200) {
                    if (isBuyNow) {
                        localStorage.removeItem('buy_now_item');
                    } else {
                        clearCart();
                    }
                    setIsOrderPlaced(true);
                }
            }
        } catch (error) {
            let msg = error.response?.data?.error || error.message;
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const flatErrors = {};
                for (const key in error.response.data.errors) {
                    flatErrors[key] = error.response.data.errors[key][0];
                }
                setErrors(flatErrors);
                msg = 'Please check the form for errors.';
            }
            if (isOnlinePayment) {
                setPaymentError(msg);
            } else {
                toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Neumorphic Soft UI Form Styles ──
    const labelStyle = "block text-sm font-normal text-gray-500 tracking-wide mb-1.5";
    const inputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-sm px-4 py-2.5 font-normal text-gray-600 placeholder:text-gray-400 focus:outline-none border-none transition-all";
    const selectStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-sm px-4 py-2.5 font-normal text-gray-600 focus:outline-none border-none cursor-pointer disabled:opacity-50 transition-all";



    if (isOrderPlaced) {
        return (
            <>
                <Head title="Order Confirmed — Bloom&Glow" />
                <StoreHeader auth={auth} />
                <div className="min-h-[75vh] flex items-center justify-center px-4 bg-[#FAF0F3]">
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-8 sm:p-10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 stroke-[2]" />
                        </div>
                        <h1 className="font-serif text-2xl font-medium text-gray-600 mb-2">Order Confirmed!</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mb-6 font-normal">Your order has been placed successfully. We're preparing your flowers!</p>
                        <Link href="/" className="w-full inline-block text-center py-3 px-6 rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-xs font-medium shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all uppercase tracking-wider">
                            Return to Store
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout — Bloom&Glow" />
            <CartDrawer />
            <div className="store-shell min-h-screen bg-[#FAF0F3] text-gray-600 selection:bg-pink-200 selection:text-pink-900" style={{fontFamily:'"Inter",sans-serif', fontWeight:400, letterSpacing:'0.01em'}}>
                <StoreHeader auth={auth} />

                <main className="w-full px-4 sm:px-6 py-12">
                    {/* Header Bar */}
                    <motion.div
                        className="mb-6 border-b border-pink-200/40 pb-4 flex items-center justify-between"
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-gray-700" style={{fontFamily:'"Inter",sans-serif'}}>Checkout</h1>
                            <p className="text-sm text-gray-400 mt-0.5 font-normal">Ordering from <span className="font-normal text-[#E91E63]">{shopName}</span></p>
                        </div>
                        {/* Top Step Indicators */}
                        <div className="flex items-center gap-1 sm:gap-6 text-[10px] sm:text-xs font-normal uppercase tracking-widest text-gray-400 justify-center">
                            <div className="flex items-center gap-1 sm:gap-2 text-[#E91E63]">
                                <span className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] text-[#E91E63] flex items-center justify-center font-normal">1</span>
                                <span className="whitespace-nowrap"><span className="hidden sm:inline">Fulfillment &amp; </span>Map</span>
                            </div>
                            <span className="text-pink-200 mx-1 sm:mx-0">→</span>
                            <div className="flex items-center gap-1 sm:gap-2 text-[#E91E63]">
                                <span className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] text-[#E91E63] flex items-center justify-center font-normal">2</span>
                                <span className="whitespace-nowrap">Payment<span className="hidden sm:inline"> &amp; Order</span></span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ════════ HORIZONTAL 2-COLUMN LAYOUT ════════ */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >

                        {/* ────── COLUMN 2: Fulfillment & Interactive Route Map ────── */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-pink-200/40 pb-3">
                                <div className="flex items-center gap-2 text-[#E91E63]">
                                    <Truck className="w-4 h-4 stroke-[2]" />
                                    <h2 className="text-xs sm:text-sm font-medium text-gray-600 tracking-tight">1. Fulfillment &amp; Route Map</h2>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {/* Removed CHANGE button per user request */}
                                    {/* Segmented Neumorphic button */}
                                    <div className="inline-flex rounded-2xl bg-[#FAF0F3] shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] p-1 border border-white/60 text-[11px]">
                                        <button type="button" onClick={() => setDeliveryMethod('delivery')} className={`px-3 py-1 rounded-xl font-medium transition-all ${deliveryMethod === 'delivery' ? 'bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'text-gray-500 hover:text-[#E91E63]'}`}>
                                            Delivery (+₱{shippingFee.toFixed(2)})
                                        </button>
                                        <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`px-3 py-1 rounded-xl font-medium transition-all ${deliveryMethod === 'pickup' ? 'bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'text-gray-500 hover:text-[#E91E63]'}`}>
                                            Pickup (Free)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Fulfillment Method Banner Info */}
                            {deliveryMethod === 'pickup' ? (
                                <div className="py-2 border-l-[3px] border-gray-300 pl-4">
                                    <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-1">Store Pickup</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Collect your order from <span className="font-medium text-gray-500">{shopName}</span> ({shopAddress}).
                                    </p>
                                </div>
                            ) : (
                                <div className="py-2 border-l-[3px] border-pink-400 pl-4">
                                    <p className="text-[11px] font-medium text-[#E91E63] uppercase tracking-wider mb-1">Doorstep Delivery</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Your items will be delivered directly to your specified address.
                                    </p>
                                </div>
                            )}

                            {/* Delivery Address Fields (Only when Delivery selected) */}
                            {deliveryMethod === 'delivery' && (
                                <div className="space-y-3">
                                    {/* Summary View vs Edit View for Address */}
                                    {!isEditingAddress ? (
                                        <div className="p-4 bg-white/60 rounded-xl border border-pink-200/50 relative">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Shipping Address</p>
                                            <p className="text-[13px] font-medium text-gray-700 leading-tight">
                                                {address.street} {address.landmark ? `(${address.landmark})` : ''}
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-1">
                                                Brgy. {address.barangayName}, {address.cityName}
                                            </p>
                                            <p className="text-[11px] text-gray-500">
                                                {address.provinceName}, {address.regionName}
                                            </p>
                                            <div className="absolute top-4 right-4">
                                                <button type="button" onClick={() => setIsEditingAddress(true)} className="text-[10px] font-bold text-[#E91E63] hover:text-pink-700 uppercase tracking-wider bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded border border-pink-200 transition-colors">
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className={labelStyle}>Province</label>
                                                <div className="w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-2.5 font-bold text-gray-500 border border-white/60 select-none">
                                                    Davao del Sur
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>City / Municipality</label>
                                                <select value={address.cityCode} onChange={e => handleCityChange(e.target.value)} disabled={loadingCities} className={selectStyle}>
                                                    <option value="">Select City</option>
                                                    {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                                </select>
                                            </div>
                                    <div>
                                        <label className={labelStyle}>Barangay</label>
                                        <select value={address.barangayCode} onChange={e => handleBarangayChange(e.target.value)} disabled={loadingBarangays || !address.cityCode} className={selectStyle}>
                                            <option value="">Select Barangay</option>
                                            {barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Street Address</label>
                                        <input type="text" value={address.street} onChange={e => { skipForwardGeocode.current = false; setAddress({ ...address, street: e.target.value }); }} className={inputStyle} placeholder="House / Building #, Street" />
                                        {errors['address.street'] && <p className="text-sm text-red-500 mt-1">{errors['address.street']}</p>}
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Landmark / Directions</label>
                                        <input type="text" value={address.landmark} onChange={e => { skipForwardGeocode.current = false; setAddress({ ...address, landmark: e.target.value }); }} className={inputStyle} placeholder="Near church / school" />
                                    </div>

                                    {/* GPS Location Button for Delivery */}
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={handleAutoLocate}
                                                disabled={isLocating}
                                                title="Auto-detect & Pin Delivery Address"
                                                className="w-9 h-9 rounded-full bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-[#E91E63] hover:shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                                            >
                                                {isLocating ? (
                                                    <svg className="animate-spin w-4 h-4 text-[#E91E63]" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                ) : (
                                                    <Navigation className="w-4 h-4 stroke-[1.8]" />
                                                )}
                                            </button>
                                            <div>
                                                <p className="text-xs font-medium text-gray-600 leading-tight">
                                                    {isLocating ? 'Detecting Location...' : 'Pin Delivery Address'}
                                                </p>
                                                <p className="text-[10px] text-gray-400">Auto-detects GPS address</p>
                                            </div>
                                        </div>

                                        {deliveryLocation && (
                                            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Pinned
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 pt-3 border-t border-pink-200/40">
                                        <button 
                                            type="button" 
                                            onClick={handleSaveAddress}
                                            disabled={isSavingAddress}
                                            className="px-5 py-2.5 bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white rounded-xl text-xs font-semibold shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {isSavingAddress ? 'Saving...' : 'Save to Profile'}
                                        </button>
                                        {hasValidAddress && (
                                            <button 
                                                type="button" 
                                                onClick={() => setIsEditingAddress(false)}
                                                className="px-5 py-2.5 bg-[#FAF0F3] text-gray-600 rounded-xl text-xs font-semibold hover:text-[#E91E63] shadow-[3px_3px_6px_#e2d7da,-3px_-3px_6px_#ffffff] transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                    </>
                                    )}
                                </div>
                            )}

                            {/* GPS Location Button for Pickup */}
                            {deliveryMethod === 'pickup' && (
                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={handleAutoLocate}
                                            disabled={isLocating}
                                            title="Detect Starting Location"
                                            className="w-9 h-9 rounded-full bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-blue-600 hover:shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                                        >
                                            {isLocating ? (
                                                <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : (
                                                <Navigation className="w-4 h-4 stroke-[1.8]" />
                                            )}
                                        </button>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 leading-tight">
                                                {isLocating ? 'Detecting Location...' : 'Use My Current Location'}
                                            </p>
                                            <p className="text-[10px] text-gray-400">Updates route start point from your GPS</p>
                                        </div>
                                    </div>

                                    {deliveryLocation && (
                                        <span className="text-[10px] text-blue-700 font-medium bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1 shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                            GPS Active
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* ────── IN-COLUMN MAP ────── */}
                            <div className="mt-4 pt-4 border-t border-pink-200/40 flex flex-col items-center space-y-4 w-full">
                                <div className="flex flex-col items-center justify-center text-center font-medium text-gray-600 text-sm gap-0.5">
                                    <span className="text-[11px] font-bold text-[#E91E63] uppercase tracking-wider">{deliveryMethod === 'pickup' ? 'Pickup Route' : 'Delivery Route'}</span>
                                    <span className="text-xs font-normal text-gray-500">{shopName}</span>
                                </div>

                                {/* The Rectangular Map */}
                                <div className="w-full h-52 sm:h-60 md:h-[280px] rounded-2xl overflow-hidden shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] border border-white/60 relative shrink-0">
                                    <RoutingMap 
                                        userLocation={effectiveUserLocation}
                                        shopLocation={shopLocation}
                                        shopName={shopName}
                                        routeData={routeData}
                                        mode={deliveryMethod}
                                        onMapClick={(latlng) => {
                                            skipForwardGeocode.current = true;
                                            setDeliveryLocation({ lat: latlng.lat, lng: latlng.lng });
                                            reverseGeocode(latlng.lat, latlng.lng);
                                        }}
                                    />
                                    {routeMeta && (
                                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-pink-100 text-[10px] sm:text-[11px] flex flex-col gap-0.5 z-[1000] whitespace-nowrap">
                                            <div><span className="text-gray-500">Dist: </span><strong className="text-gray-700">{routeMeta.distance}</strong></div>
                                            <div><span className="text-gray-500">Time: </span><strong className="text-[#E91E63]">{routeMeta.duration}</strong></div>
                                        </div>
                                    )}
                                </div>

                                {routeError && (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5 mt-2 shadow-sm w-full">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                        <span>{routeError}</span>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* ────── COLUMN 2: Schedule, Payment, Add-ons & Order Summary ────── */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-pink-200/40 pb-3">
                                <div className="flex items-center gap-2 text-[#E91E63]">
                                    <ShoppingBag className="w-4 h-4 stroke-[2]" />
                                    <h2 className="text-xs sm:text-sm font-medium text-gray-600 tracking-tight">2. Schedule &amp; Order Summary</h2>
                                </div>
                                <span className="text-[11px] font-medium text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full">{checkoutCount} items</span>
                            </div>

                            {auth?.user?.role === 'admin' && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium leading-relaxed">
                                    <span className="font-medium">🔒 Admin Preview Mode:</span> You can view pricing and shipping calculations, but placing live orders is disabled for admin accounts.
                                </div>
                            )}

                            {/* Schedule & Payment */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelStyle}>Date</label>
                                    <input type="date" min={new Date().toISOString().split('T')[0]} value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Time Slot</label>
                                    <select value={schedule.time} onChange={e => setSchedule({ ...schedule, time: e.target.value })} className={selectStyle}>
                                        {TIME_OPTIONS.map(t => <option key={t} value={t === 'Select Time' ? '' : t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelStyle}>Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => {
                                        setPaymentMethod(e.target.value);
                                        setPaymentError(null);
                                    }}
                                    className={selectStyle}
                                >
                                    <option value="cod">Cash on Delivery (COD)</option>
                                    <option value="stripe">Online Payment (Cards, Apple Pay, Google Pay, Wallets)</option>
                                </select>
                            </div>

                            {/* Addons Pills */}
                            <div>
                                <label className={labelStyle}>Optional Add-ons</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {ADD_ONS.map(addon => (
                                        <button key={addon.id} type="button" onClick={() => toggleAddOn(addon.id)}
                                            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                                                specialRequests.addOns.includes(addon.id)
                                                    ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]'
                                                    : 'bg-[#FAF0F3] text-gray-600 shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] hover:text-[#E91E63]'
                                            }`}>
                                            {addon.label} {addon.price > 0 ? `(+₱${addon.price})` : '(Free)'}
                                        </button>
                                    ))}
                                </div>
                                {specialRequests.addOns.includes('note') && (
                                    <textarea value={specialRequests.note} onChange={e => setSpecialRequests({ ...specialRequests, note: e.target.value })} rows={2} className={`${inputStyle} mt-2 resize-none`} placeholder="Custom note..." />
                                )}
                            </div>

                            {/* Cart Item Preview */}
                            <div className="pt-2 border-t border-pink-200/40">
                                <label className={labelStyle}>Selected Items</label>
                                {checkoutItems.length > 0 ? (
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                                        {checkoutItems.map(item => (
                                            <div key={item.product_id} className="flex items-center gap-4 text-xs">
                                                <img src={getProductImage(item)} alt="" className="w-16 h-16 object-cover rounded-2xl border border-pink-200/50 shrink-0 shadow-sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-600 truncate">{item.flower_name || item.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1.5 bg-[#FAF0F3] rounded-full px-2 py-0.5 border border-pink-200/50">
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isBuyNow) {
                                                                        if (item.quantity > 1) {
                                                                            updateBuyNowQuantity(-1);
                                                                        } else {
                                                                            removeBuyNowItem();
                                                                        }
                                                                    } else {
                                                                        if (item.quantity > 1) {
                                                                            updateQuantity(item.product_id, -1);
                                                                        } else {
                                                                            removeFromCart(item.product_id);
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-gray-500 hover:text-[#E91E63] w-4 h-4 flex items-center justify-center font-bold"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-[10px] font-medium text-gray-700 w-3 text-center">{item.quantity}</span>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isBuyNow) {
                                                                        updateBuyNowQuantity(1);
                                                                    } else {
                                                                        updateQuantity(item.product_id, 1);
                                                                    }
                                                                }}
                                                                disabled={item.quantity >= item.stock}
                                                                className="text-gray-500 hover:text-[#E91E63] w-4 h-4 flex items-center justify-center font-bold disabled:opacity-30 disabled:hover:text-gray-500"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <span className="text-gray-400 text-[10px]">× ₱{Number(item.price).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <span className="font-medium text-gray-600 whitespace-nowrap">₱{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-[#FAF0F3] p-4 rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] space-y-2.5 text-sm">
                                <div className="flex justify-between text-gray-500 font-normal">
                                    <span>Subtotal</span>
                                    <span>₱{checkoutSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-normal">
                                    <span>Shipping ({deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'})</span>
                                    <span>{deliveryMethod === 'pickup' ? <span className="text-emerald-600">Free</span> : `₱${shippingFee.toFixed(2)}`}</span>
                                </div>
                                {addOnTotal > 0 && (
                                    <div className="flex justify-between text-gray-500 font-normal">
                                        <span>Add-ons</span>
                                        <span>₱{addOnTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-normal text-gray-700 pt-2.5 border-t border-pink-200/40">
                                    <span>Total</span>
                                    <span className="text-[#E91E63] text-lg font-normal">₱{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Terms & Privacy Checkbox */}
                            <label className="flex items-start gap-2 cursor-pointer select-none text-sm text-gray-500 font-normal pt-1">
                                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63] w-4 h-4 mt-0.5 shrink-0" />
                                <span>I agree to the <a href="#" className="text-[#E91E63] font-normal link-hover-scale">Terms</a> &amp; <a href="#" className="text-[#E91E63] font-normal link-hover-scale">Privacy Policy</a></span>
                            </label>

                            {/* Place Order / Pay Button */}
                            {checkoutItems.length === 0 ? (
                                <Link
                                    href="/"
                                    className="w-full py-3.5 px-4 text-sm tracking-wide font-normal rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all flex items-center justify-center"
                                >
                                    Continue Shopping
                                </Link>
                            ) : (
                                <>
                                    {paymentError && (
                                        <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                                            {paymentError}
                                        </div>
                                    )}

                                    {isOnlinePayment && (
                                        <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-700 font-medium flex items-start gap-2">
                                            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            <span>You'll be securely redirected to Stripe to complete your payment with Card, Apple Pay, Google Pay, or other available methods.</span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handlePlaceOrder}
                                        disabled={!agreedToTerms || isSubmitting || auth?.user?.role === 'admin'}
                                        title={auth?.user?.role === 'admin' ? 'Admins cannot place orders' : ''}
                                        className={`w-full py-4 px-4 text-sm tracking-wide font-normal rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all flex items-center justify-center gap-2 ${(!agreedToTerms || isSubmitting || auth?.user?.role === 'admin') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                <span>{isOnlinePayment ? 'Redirecting to Payment...' : 'Placing Order...'}</span>
                                            </>
                                        ) : (
                                            <span>{isOnlinePayment ? 'Proceed to Secure Payment' : 'Place Order'}</span>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                    </motion.div>
                    

                </main>
            </div>
        </>
    );
}
