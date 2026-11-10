import { useState, useEffect } from 'react';

const ALLOWED_IMAGES = ['dynamic_bg_1', 'dynamic_bg_2', 'dynamic_bg_3', 'dynamic_bg_4', 'dynamic_bg_5'];

const getRandomImage = (exclude = null) => {
    let next;
    do {
        next = ALLOWED_IMAGES[Math.floor(Math.random() * ALLOWED_IMAGES.length)];
    } while (next === exclude && ALLOWED_IMAGES.length > 1);
    return next;
};

export default function BackgroundSlideshow() {
    const [images, setImages] = useState({
        primary: getRandomImage(),
        secondary: getRandomImage(),
        activeIsPrimary: true
    });

    const [offsetY, setOffsetY] = useState(0);

    useEffect(() => {
        // Ensure secondary is different from primary on mount
        setImages(prev => {
            if (prev.primary === prev.secondary) {
                return { ...prev, secondary: getRandomImage(prev.primary) };
            }
            return prev;
        });

        const handleScroll = () => {
            setOffsetY(window.scrollY * 0.45);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        const interval = setInterval(() => {
            setImages(prev => {
                const nextActiveIsPrimary = !prev.activeIsPrimary;
                return {
                    primary: nextActiveIsPrimary ? prev.primary : getRandomImage(prev.secondary),
                    secondary: !nextActiveIsPrimary ? prev.secondary : getRandomImage(prev.primary),
                    activeIsPrimary: nextActiveIsPrimary
                };
            });
        }, 6000); // Change image every 6 seconds

        return () => {
            clearInterval(interval);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <style>{`
                @keyframes kenburns-primary {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.12); }
                }
                @keyframes kenburns-secondary {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.12); }
                }
                .slide-layer {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    transition: opacity 2s ease-in-out;
                    will-change: opacity, transform;
                }
                .slide-active {
                    opacity: 1;
                    z-index: 1;
                }
                .slide-inactive {
                    opacity: 0;
                    z-index: 0;
                }
                .anim-primary {
                    animation: kenburns-primary 14s linear infinite alternate;
                }
                .anim-secondary {
                    animation: kenburns-secondary 16s linear infinite alternate-reverse;
                }
            `}</style>

            <link rel="preload" as="image" href={`/images/${images.primary}.jpg`} />
            <link rel="preload" as="image" href={`/images/${images.secondary}.jpg`} />
            
            <div className="absolute inset-0 overflow-hidden bg-black">
                <div 
                    className="absolute inset-0 w-full h-[150%] -top-[25%] will-change-transform"
                    style={{ transform: `translateY(${offsetY}px)` }}
                >
                    <div
                        className={`slide-layer anim-primary ${images.activeIsPrimary ? 'slide-active' : 'slide-inactive'}`}
                        style={{ backgroundImage: `url('/images/${images.primary}.jpg')` }}
                    />
                    <div
                        className={`slide-layer anim-secondary ${!images.activeIsPrimary ? 'slide-active' : 'slide-inactive'}`}
                        style={{ backgroundImage: `url('/images/${images.secondary}.jpg')` }}
                    />
                </div>
                {/* Single subtle overlay to ensure text readability without hiding the image */}
                <div className="absolute inset-0 bg-black/30 z-[2]" />
            </div>
        </>
    );
}
