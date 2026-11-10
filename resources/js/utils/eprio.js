export const ADD_ONS = [
    { id: 'card', label: 'Card/Message', price: 0 },
    { id: 'cake_tag', label: 'Cake Tag', price: 0 },
    { id: 'balloon_sticker', label: 'Balloon Sticker', price: 0 },
    { id: 'note', label: 'Note', price: 0 },
    { id: 'chocolate_pack', label: 'Chocolate Pack', price: 100 },
    { id: 'polaroid_photo', label: 'Polaroid Photo', price: 150 },
];

/**
 * E-PRIO Algorithm: Evaluates the current cart items (primarily the main flower/product)
 * and returns ranked add-on recommendations.
 */
export function getEprioRecommendations(cartItems) {
    if (!cartItems || cartItems.length === 0) return [];

    // Base scoring initialized for each add-on
    let scores = {};
    ADD_ONS.forEach(addon => {
        scores[addon.id] = 0;
    });

    // We mainly look at the last added item to recommend add-ons
    const primaryItem = cartItems[cartItems.length - 1];
    const name = (primaryItem?.flower_name || primaryItem?.name || '').toLowerCase();
    
    // 1. Product Category / Name matching (Heuristics)
    if (name.includes('rose') || name.includes('bouquet') || name.includes('tulip')) {
        scores['chocolate_pack'] += 10;
        scores['polaroid_photo'] += 8;
        scores['card'] += 5;
    }

    if (name.includes('birthday')) {
        scores['cake_tag'] += 15;
        scores['balloon_sticker'] += 15;
        scores['card'] += 5;
    }

    if (name.includes('sympathy') || name.includes('funeral')) {
        scores['note'] += 15;
        scores['card'] += 10;
        // Negative weight for inappropriate items
        scores['cake_tag'] -= 20;
        scores['balloon_sticker'] -= 20;
    }

    if (name.includes('anniversary') || name.includes('love')) {
        scores['chocolate_pack'] += 12;
        scores['polaroid_photo'] += 10;
        scores['card'] += 8;
    }

    // Default universal boosters
    scores['card'] += 2; // Card is always somewhat relevant
    scores['note'] += 1; // Note is always somewhat relevant

    // Convert to array and sort by score descending
    const rankedAddOns = ADD_ONS.map(addon => ({
        ...addon,
        score: scores[addon.id]
    }))
    .filter(a => a.score >= 0) // Filter out negative scores
    .sort((a, b) => b.score - a.score);

    // Return the top 3 recommendations
    return rankedAddOns.slice(0, 3);
}
