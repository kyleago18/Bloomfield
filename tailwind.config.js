import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                bloom: {
                    bg: '#FFFBF7',
                    green: '#7D8C65',
                    peach: '#F29C79',
                    text: '#3E3935',
                },
                peach: {
                    DEFAULT: '#8b9c7b',
                    light: '#a3b194',
                    dark: '#5f6b54',
                },
                tangerine: {
                    DEFAULT: '#d4727a',
                    light: '#e8a0a8',
                    dark: '#b85560',
                },
                rose: {
                    DEFAULT: '#d4727a',
                    light: '#f9e8ea',
                    dark: '#b85560',
                },
                ink: {
                    DEFAULT: '#2a2426',
                    muted: '#6b6164',
                },
                botanical: {
                    ivory: '#FFFDF9',       // Background
                    pearl: '#FFFFFF',        // Cards
                    champagne: '#F0E0E3',   // Soft border (blush-tinted)
                    sage: '#A8C3A0',         // Accent: Sage Green
                    olive: '#7DA276',        // Darker sage for text on sage bg
                    'dark-olive': '#5A8A52', // Deepest sage
                    blush: '#F8D7DA',        // Secondary: Blush Pink
                    lavender: '#C97C8A',     // Primary: Dusty Rose (replaces lavender)
                    slate: '#3D2C2E',        // Text
                    gold: '#D4AF37',         // Gold Accent
                }
            },
            fontFamily: {
                sans: ['"Outfit"', '"Inter"', ...defaultTheme.fontFamily.sans],
                serif: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
            },
            boxShadow: {
                soft: '0 4px 24px -4px rgba(201, 124, 138, 0.08)',
                lift: '0 12px 40px -8px rgba(201, 124, 138, 0.14)',
                glow: '0 0 30px rgba(201, 124, 138, 0.15)',
                inner: 'inset 0 2px 4px 0 rgba(201, 124, 138, 0.04)',
            },
            borderRadius: {
                '2xl': '1.25rem',
                '3xl': '1.75rem',
            },
        },
    },

    plugins: [forms],
};
