import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { ADD_ONS } from '../utils/eprio';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedAddOns, setSelectedAddOns] = useState([]);

    useEffect(() => {
        fetchCart();
        
        // Re-fetch cart when Inertia finishes a navigation event (like login/logout)
        const removeListener = router.on('success', () => {
            fetchCart();
        });

        return () => removeListener();
    }, []);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/cart');
            setCartItems(response.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product) => {
        // Prevent sellers from purchasing their own products
        const user = router.page?.props?.auth?.user;
        const sellerId = product.seller_id ?? product.seller?.id;
        if (user?.seller?.id && user.seller.id === sellerId) {
            toast.error("You cannot add your own products to the cart.");
            return;
        }

        const productId = product.product_id ?? product.id;
        const previousCart = [...cartItems];
        
        // Optimistically check multi-vendor restriction
        if (cartItems.length > 0 && cartItems[0].seller_id !== sellerId) {
            toast.error("You can only order from one shop at a time.");
            return;
        }

        // Optimistic UI Update
        const existingItemIndex = cartItems.findIndex(item => item.product_id === productId);
        let newCart = [...cartItems];
        
        if (existingItemIndex >= 0) {
            const currentQty = newCart[existingItemIndex].quantity;
            if (currentQty + 1 > product.stock) {
                toast.error(`Cannot exceed available stock (${product.stock}).`);
                return;
            }
            newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity: currentQty + 1 };
        } else {
            if (1 > product.stock) {
                toast.error(`Cannot exceed available stock (${product.stock}).`);
                return;
            }
            newCart.push({
                id: 'temp-' + Date.now(),
                product_id: productId,
                seller_id: sellerId,
                quantity: 1,
                price: product.price,
                name: product.name ?? product.flower_name,
                flower_name: product.flower_name,
                stock: product.stock,
                thumbnail_url: product.thumbnail_url,
            });
        }

        setCartItems(newCart);

        try {
            const response = await axios.post('/api/cart', {
                product_id: productId,
                quantity: 1
            });
            // Update with real data from server (to get actual cart item IDs)
            setCartItems(response.data);
            toast.success("Added to cart!");
        } catch (error) {
            // Revert on failure
            setCartItems(previousCart);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("Failed to add to cart.");
            }
        }
    };

    const removeFromCart = async (productId) => {
        const previousCart = [...cartItems];
        // Optimistic UI Update
        setCartItems(cartItems.filter(item => item.product_id !== productId));
        
        try {
            const response = await axios.delete(`/api/cart/${productId}`);
            setCartItems(response.data);
            toast.success("Removed from cart.");
        } catch (error) {
            // Revert on failure
            setCartItems(previousCart);
            toast.error("Failed to remove item.");
        }
    };

    const updateQuantity = async (productId, amount) => {
        const previousCart = [...cartItems];
        let errorOccurred = false;

        // Optimistic UI Update
        const newCart = cartItems.map(item => {
            if (item.product_id === productId) {
                const newQty = item.quantity + amount;
                if (newQty > item.stock) {
                    errorOccurred = true;
                    toast.error(`Cannot exceed available stock (${item.stock}).`);
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0);

        if (errorOccurred) return;

        setCartItems(newCart);

        try {
            const response = await axios.put(`/api/cart/${productId}`, { amount });
            setCartItems(response.data);
        } catch (error) {
            // Revert on failure
            setCartItems(previousCart);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("Failed to update quantity.");
            }
        }
    };

    const toggleCartDrawer = () => {
        setIsCartOpen(!isCartOpen);
    };

    const closeCartDrawer = () => {
        setIsCartOpen(false);
    };

    const clearCart = async () => {
        try {
            const response = await axios.delete('/api/cart/clear');
            setCartItems(response.data);
            setSelectedAddOns([]);
        } catch (error) {
            toast.error("Failed to clear cart.");
        }
    };

    const toggleAddOn = (addOnId) => {
        setSelectedAddOns(prev => {
            if (prev.includes(addOnId)) {
                return prev.filter(id => id !== addOnId);
            } else {
                return [...prev, addOnId];
            }
        });
    };

    const removeAddOn = (addOnId) => {
        setSelectedAddOns(prev => prev.filter(id => id !== addOnId));
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const cartSubtotalItems = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const addOnTotal = selectedAddOns.reduce((sum, addOnId) => {
        const addOn = ADD_ONS.find(a => a.id === addOnId);
        return sum + (addOn ? addOn.price : 0);
    }, 0);
    const cartSubtotal = cartSubtotalItems + addOnTotal;

    const value = {
        cartItems,
        isCartOpen,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCartDrawer,
        closeCartDrawer,
        clearCart,
        cartCount,
        cartSubtotal,
        selectedAddOns,
        toggleAddOn,
        removeAddOn,
        addOnTotal,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
