const ALL_IMAGES = [
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg',
    '/images/4.jpg',
    '/images/5.jpg',
    '/images/6.jpg',
    '/images/7.jpg',
    '/images/8.jpg',
    '/images/9.jpg',
    '/images/10.jpg',
    '/images/11.jpg',
    '/images/12.jpg',
    '/images/13.jpg',
    '/images/14.jpg',
    '/images/15.jpg',
    '/images/16.jpg',
];

function sanitizeImagePath(pathStr) {
    if (!pathStr || typeof pathStr !== 'string') return null;
    if (pathStr.startsWith('http') || pathStr.startsWith('//')) return pathStr;
    
    // Remove leading slash for easier checking
    const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr;
    
    if (cleanPath.startsWith('storage/') || cleanPath.startsWith('images/')) {
        return '/' + cleanPath;
    }
    
    // Otherwise, assume it's a storage upload path (like products/thumbnails/...)
    return '/storage/' + cleanPath;
}

export function getProductImage(item) {
    if (!item) return ALL_IMAGES[0];

    // If item is a direct image path string:
    if (typeof item === 'string') {
        const validPath = sanitizeImagePath(item);
        if (validPath) return validPath;
    } else {
        const rawPath = item.thumbnail_url || item.image_url || item.thumbnail || item.image;
        const validPath = sanitizeImagePath(rawPath);
        if (validPath) return validPath;
    }

    // Deterministic fallback strictly mapped between 1.jpg and 16.jpg based on product ID
    const idNum = Math.abs(parseInt(item.product_id || item.id || 1, 10)) || 1;
    const idx = (idNum - 1) % ALL_IMAGES.length;
    return ALL_IMAGES[idx];
}

export { ALL_IMAGES };
