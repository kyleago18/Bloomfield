import React, { Children } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({ children, className = '', animation = 'fade-up', delay = 0, stagger = false }) {
    const prefersReducedMotion = useReducedMotion();

    const getVariants = () => {
        if (prefersReducedMotion) {
            return {
                hidden: { opacity: 1 },
                show: { opacity: 1 }
            };
        }

        switch (animation) {
            case 'scale-up':
                return {
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
                };
            case 'fade-up':
            default:
                return {
                    hidden: { opacity: 0, y: 25, scale: 0.98 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
                };
        }
    };

    if (stagger) {
        return (
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1,
                            delayChildren: delay / 1000,
                        }
                    }
                }}
                className={className}
            >
                {Children.map(children, (child) => (
                    <motion.div variants={getVariants()}>
                        {child}
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={getVariants()}
            transition={{ delay: delay / 1000 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
