import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import ProductCard from './ProductCard';

export default function ProductCarousel({ products, onAdd, searchQuery, rows = 1 }) {
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full relative py-4 group/carousel">
            <Swiper
                grabCursor={true}
                spaceBetween={16}
                slidesPerView={1.2}
                speed={600}
                breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 3, spaceBetween: 24 },
                    1280: { slidesPerView: 4, spaceBetween: 24 }
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                navigation={false}
                modules={[Pagination]}
                className="w-full !pb-12 !px-2"
            >
                {products.map((product) => (
                    <SwiperSlide 
                        key={product.product_id} 
                        className="transition-transform duration-300 !h-auto flex flex-col"
                    >
                        <div className="w-full py-2">
                            <ProductCard 
                                product={product} 
                                onAdd={onAdd} 
                                searchQuery={searchQuery} 
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style>{`
                .swiper-slide {
                    height: auto !important; 
                }
                .swiper-pagination-bullet-active {
                    background-color: #E91E63 !important;
                }
            `}</style>
        </div>
    );
}
