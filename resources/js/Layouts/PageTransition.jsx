import React from 'react';
import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PageTransition({ children }) {
    const { url } = usePage();
    const pathname = url.split('?')[0]; // Ignore query strings for transitions

    // Handle special auth transitions
    const isAuth = pathname === '/login' || pathname === '/register';
    const isLogin = pathname === '/login';

    const getVariants = () => {
        if (isAuth) {
            return {
                initial: { opacity: 0, x: isLogin ? -30 : 30 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: isLogin ? 30 : -30 }
            };
        }
        
        return {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 }
        };
    };

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={getVariants()}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full min-h-screen flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
