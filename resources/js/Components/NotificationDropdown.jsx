import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { BellIcon, CheckIcon, ArchiveBoxIcon, EnvelopeOpenIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../utils/supabaseClient';

// Module-level cache: persists notification data across Inertia page navigations
// so we don't re-fetch on every page mount
const _notifCache = { data: [], unreadCount: 0, loaded: false };

export default function NotificationDropdown({ role, variant }) {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState(_notifCache.data);
    const [unreadCount, setUnreadCount] = useState(_notifCache.unreadCount);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showSelectBoxes, setShowSelectBoxes] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const syncCache = (notifs, count) => {
        _notifCache.data = notifs;
        _notifCache.unreadCount = count;
        _notifCache.loaded = true;
    };

    // Fetch initial notifications
    const fetchNotifications = async (force = false) => {
        if (!auth?.user) return;
        // Skip if already cached (e.g. Inertia navigation)
        if (_notifCache.loaded && !force) return;
        try {
            const response = await axios.get(route('notifications.index'));
            const notifs = response.data.notifications || [];
            const count = response.data.unread_count || 0;
            setNotifications(notifs);
            setUnreadCount(count);
            syncCache(notifs, count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Mark single notification as read
    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        
        // Optimistic Update
        const previousNotifs = [...notifications];
        const previousCount = unreadCount;
        
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n);
            syncCache(updated, Math.max(0, _notifCache.unreadCount - 1));
            return updated;
        });
        setUnreadCount(c => Math.max(0, c - 1));

        try {
            await axios.patch(route('notifications.read', id));
        } catch (error) {
            // Rollback on failure
            setNotifications(previousNotifs);
            setUnreadCount(previousCount);
            syncCache(previousNotifs, previousCount);
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        setShowSelectBoxes(true);
        // Optimistic Update
        const previousNotifs = [...notifications];
        const previousCount = unreadCount;
        
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read_at: new Date().toISOString() }));
            syncCache(updated, 0);
            return updated;
        });
        setUnreadCount(0);

        try {
            await axios.patch(route('notifications.read-all'));
        } catch (error) {
            // Rollback on failure
            setNotifications(previousNotifs);
            setUnreadCount(previousCount);
            syncCache(previousNotifs, previousCount);
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Delete single notification
    const handleDeleteSingle = async (id, e) => {
        e.stopPropagation();
        const previousNotifs = [...notifications];
        const previousCount = unreadCount;

        const notifToDelete = notifications.find(n => n.id === id);
        const wasUnread = notifToDelete && !notifToDelete.read_at;

        const updatedNotifs = notifications.filter(n => n.id !== id);
        const newUnreadCount = wasUnread ? Math.max(0, unreadCount - 1) : unreadCount;

        setNotifications(updatedNotifs);
        setUnreadCount(newUnreadCount);
        setSelectedIds(prev => prev.filter(sId => sId !== id));
        syncCache(updatedNotifs, newUnreadCount);

        try {
            await axios.delete(route('notifications.destroy', id));
        } catch (error) {
            setNotifications(previousNotifs);
            setUnreadCount(previousCount);
            syncCache(previousNotifs, previousCount);
            console.error('Failed to delete notification:', error);
        }
    };

    // Delete selected notifications
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const previousNotifs = [...notifications];
        const previousCount = unreadCount;

        const deletedUnreadCount = notifications.filter(n => selectedIds.includes(n.id) && !n.read_at).length;
        const updatedNotifs = notifications.filter(n => !selectedIds.includes(n.id));
        const newUnreadCount = Math.max(0, unreadCount - deletedUnreadCount);

        setNotifications(updatedNotifs);
        setUnreadCount(newUnreadCount);
        setSelectedIds([]);
        setShowSelectBoxes(false);
        syncCache(updatedNotifs, newUnreadCount);

        try {
            await axios.delete(route('notifications.delete-selected'), { data: { ids: selectedIds } });
        } catch (error) {
            setNotifications(previousNotifs);
            setUnreadCount(previousCount);
            syncCache(previousNotifs, previousCount);
            console.error('Failed to delete selected notifications:', error);
        }
    };

    // Delete all notifications
    const handleDeleteAll = async () => {
        if (notifications.length === 0) return;
        const previousNotifs = [...notifications];
        const previousCount = unreadCount;

        setNotifications([]);
        setUnreadCount(0);
        setSelectedIds([]);
        setShowSelectBoxes(false);
        syncCache([], 0);

        try {
            await axios.delete(route('notifications.delete-all'));
        } catch (error) {
            setNotifications(previousNotifs);
            setUnreadCount(previousCount);
            syncCache(previousNotifs, previousCount);
            console.error('Failed to delete all notifications:', error);
        }
    };

    // Toggle select item checkbox
    const handleToggleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    // Request desktop notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Show desktop notification
    const triggerDesktopNotification = (title, body) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.png'
            });
        }
    };

    // Set up Realtime OR Polling fallback
    useEffect(() => {
        if (!auth?.user) return;

        fetchNotifications(); // Only fetches if cache is cold

        let channel = null;
        let intervalId = null;

        if (supabase) {
            // Subscribe to PostgreSQL insertions in the notifications table for this user
            channel = supabase
                .channel(`notifications:user_${auth.user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${auth.user.id}`,
                    },
                    (payload) => {
                        const newNotif = payload.new;
                        console.log('Realtime notification received:', newNotif);
                        
                        // Parse JSON data if it is a string
                        if (typeof newNotif.data === 'string') {
                            try {
                                newNotif.data = JSON.parse(newNotif.data);
                            } catch (e) {}
                        }

                        setNotifications(prev => {
                            const updated = [newNotif, ...prev.slice(0, 19)];
                            syncCache(updated, _notifCache.unreadCount + 1);
                            return updated;
                        });
                        setUnreadCount(c => c + 1);
                        
                        // Trigger desktop notification
                        triggerDesktopNotification(newNotif.title, newNotif.body);
                    }
                )
                .subscribe();
        } else {
            // Fallback: poll every 5 seconds for a snappy UI
            intervalId = setInterval(() => fetchNotifications(true), 5000);
        }

        // Close dropdown when clicking outside
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
            if (intervalId) {
                clearInterval(intervalId);
            }
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [auth?.user]);

    // Format helper for timestamps
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const diffMs = new Date() - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Render details specific to notification types
    const renderNotificationContent = (notification) => {
        const data = notification.data || {};
        const isUnread = !notification.read_at;

        if (role === 'vendor_admin') {
            // Seller-specific renders
            if (notification.type === 'new_order') {
                return (
                    <div>
                        <p className="text-[13px] text-botanical-slate font-medium">
                            <span className="font-bold text-botanical-lavender">Order {data.display_order_id || data.order_id}</span> placed by {data.customer_name}
                        </p>
                    </div>
                );
            }
            if (notification.type === 'new_review') {
                return (
                    <div className="space-y-1">
                        <p className="text-[13px] text-botanical-slate">
                            <span className="font-bold text-botanical-gold">{data.rating}★ Review</span> from {data.customer_name}
                        </p>
                        {data.comment && (
                            <p className="text-[11px] text-botanical-slate/50 italic line-clamp-2">"{data.comment}"</p>
                        )}
                    </div>
                );
            }
        }

        // Customer-specific renders (or fallbacks)
        return (
            <div>
                <p className="text-[13px] text-botanical-slate font-medium">{notification.body}</p>
                {data.shop_name && (
                    <p className="text-[11px] text-botanical-lavender font-bold mt-1 uppercase tracking-wider">{data.shop_name}</p>
                )}
            </div>
        );
    };

    const handleNotificationClick = (notification) => {
        // Mark as read optimistically
        if (!notification.read_at) {
            const previousNotifs = [...notifications];
            const previousCount = unreadCount;
            
            setNotifications(prev => {
                const updated = prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n);
                syncCache(updated, Math.max(0, _notifCache.unreadCount - 1));
                return updated;
            });
            setUnreadCount(c => Math.max(0, c - 1));

            axios.patch(route('notifications.read', notification.id)).catch(() => {
                // Rollback
                setNotifications(previousNotifs);
                setUnreadCount(previousCount);
                syncCache(previousNotifs, previousCount);
            });
        }
        setIsOpen(false);

        // Redirect to related page based on notification type
        const data = notification.data || {};
        const type = notification.type;

        if (type === 'new_order' || type === 'order_cancelled_by_customer') {
            if (data.order_id) {
                router.visit(route('seller.orders.show', data.order_id));
            }
        } else if (type === 'new_follower') {
            router.visit(route('seller.followers.index'));
        } else if (type === 'new_review') {
            router.visit(route('seller.products.index'));
        } else if (type === 'replacement_requested') {
            router.visit(route('seller.replacements.index'));
        } else if (type === 'order_status_updated' || type === 'replacement_approved' || type === 'replacement_rejected') {
            router.visit(route('profile.edit') + '?tab=purchases');
        } else {
            // Fallback: Check if the notification was meant for a seller action
            if (data.order_id) {
                if (type.includes('requested') || type.includes('new_')) {
                    router.visit(route('seller.orders.show', data.order_id));
                } else {
                    router.visit(route('profile.edit') + '?tab=purchases');
                }
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {variant === 'navLink' ? (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative hover:text-rose transition-colors flex items-center gap-2 uppercase font-medium tracking-[0.12em] text-[13px] text-ink-muted focus:outline-none"
                >
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white shadow-sm">
                            {unreadCount}
                        </span>
                    )}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-col items-center justify-center gap-1.5 hover:text-rose transition-colors cursor-pointer relative group focus:outline-none w-[72px]"
                    aria-label="Notifications"
                >
                    <BellIcon className="h-[21px] w-[21px] text-gray-700 group-hover:text-rose transition-colors stroke-[1.2]" />
                    <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-500 group-hover:text-rose transition-colors hidden sm:block leading-none">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white shadow-sm">
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="absolute right-0 mt-2 min-w-[320px] w-auto max-w-[95vw] sm:max-w-[90vw] rounded-2xl bg-white border border-botanical-champagne/80 shadow-2xl overflow-hidden z-50 animate-fade-in origin-top-right">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-botanical-champagne/50 flex flex-wrap items-center justify-between gap-2 bg-botanical-ivory/50">
                        <div className="flex items-center gap-2">
                            <span className="font-serif text-base font-bold text-botanical-slate">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="bg-botanical-lavender/10 text-botanical-lavender text-[10px] font-bold px-2 py-0.5 rounded-full border border-botanical-lavender/15">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllRead}
                                    className="text-[11px] font-bold text-botanical-lavender hover:text-[#B86B79] flex items-center gap-1 transition-colors uppercase tracking-wider"
                                    title="Mark all as read"
                                >
                                    <EnvelopeOpenIcon className="w-3.5 h-3.5" /> Mark all read
                                </button>
                            )}

                            {selectedIds.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleDeleteSelected}
                                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-lg border border-rose-200"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
                                </button>
                            ) : notifications.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    {!showSelectBoxes && unreadCount === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowSelectBoxes(true)}
                                            className="text-[11px] font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider"
                                        >
                                            Select
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleDeleteAll}
                                        className="text-[11px] font-bold text-gray-500 hover:text-rose-600 flex items-center gap-1 transition-colors uppercase tracking-wider"
                                        title="Delete all notifications"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" /> Delete All
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="min-w-[320px] w-[88vw] sm:w-[540px] min-h-[150px] h-[350px] max-h-[80vh] resize overflow-auto divide-y divide-botanical-champagne/30 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                                <ArchiveBoxIcon className="w-8 h-8 text-botanical-champagne stroke-[1.2] mb-2" />
                                <p className="text-[12px] font-medium text-botanical-slate/40">Your inbox is clean!</p>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const isUnread = !notif.read_at;
                                const isSelected = selectedIds.includes(notif.id);
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`group/item p-3 px-4 flex items-start gap-3 hover:bg-botanical-blush/10 cursor-pointer transition-all duration-200 relative ${
                                            isUnread ? 'bg-gradient-to-r from-botanical-blush/5 to-transparent' : ''
                                        } ${isSelected ? 'bg-rose-50/50' : ''}`}
                                    >
                                        {/* Checkbox for selection (only visible when Mark all read clicked or selection active) */}
                                        {(showSelectBoxes || selectedIds.length > 0) && (
                                            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleToggleSelect(notif.id, e)}
                                                    className="w-4 h-4 rounded text-rose focus:ring-rose border-gray-300 cursor-pointer accent-[#E91E63]"
                                                />
                                            </div>
                                        )}

                                        {/* Status Dot */}
                                        {isUnread && (
                                            <span className="w-2 h-2 rounded-full bg-botanical-lavender shrink-0 mt-1.5"></span>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-[13px] font-bold text-botanical-slate leading-tight ${isUnread ? 'font-extrabold' : ''}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] font-medium text-botanical-slate/40 shrink-0 mt-0.5">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-1.5">
                                                {renderNotificationContent(notif)}
                                            </div>
                                        </div>

                                        {/* Action Buttons: Mark Read & Delete Single */}
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity">
                                            {isUnread && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleMarkRead(notif.id, e)}
                                                    className="p-1.5 rounded-full bg-botanical-pearl border border-botanical-champagne/60 hover:bg-botanical-lavender/10 text-botanical-slate/40 hover:text-botanical-lavender transition-all"
                                                    title="Mark as read"
                                                >
                                                    <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteSingle(notif.id, e)}
                                                className="p-1.5 rounded-full bg-botanical-pearl border border-botanical-champagne/60 hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition-all"
                                                title="Delete notification"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5 stroke-[2]" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
