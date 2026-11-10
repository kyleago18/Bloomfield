import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

/**
 * Custom hook that watches Inertia flash props and fires Sonner toasts.
 * Drop this into any layout component to get automatic toast notifications
 * for all controller ->with('success', '…') / ->with('error', '…') calls.
 */
export default function useFlashToast() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 4000,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                duration: 5000,
            });
        }

        if (flash?.info) {
            toast.info(flash.info, {
                duration: 4000,
            });
        }
    }, [flash?.success, flash?.error, flash?.info]);
}
