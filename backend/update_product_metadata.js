const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const defaultSizes = JSON.stringify(['S', 'M', 'L', 'XL']);
    const shoeSizes = JSON.stringify(['38', '39', '40', '41', '42', '43', '44', '45']);
    const accessoriesSizes = JSON.stringify(['One Size']);
    const giftCardSizes = JSON.stringify(['$50', '$100', '$250', '$500']);

    const updates = [
        // Accessories
        {
            oldName: 'Luxury Silk Scarf',
            newName: 'Emerald Satin Bow Headpiece',
            description: 'A luxurious emerald green satin bow headpiece, handcrafted for a regal and sophisticated look. Perfect for gala evenings or high-fashion statements.',
            sizes: accessoriesSizes,
            colors: JSON.stringify(['Emerald', 'Midnight Black', 'Ruby Red'])
        },
        {
            oldName: 'Designer Sunglasses',
            newName: 'Classic Aviator Gold Gilded Shades',
            description: 'Timeless aviator silhouettes meeting modern luxury. These shades feature 18k gold-plated accents and polarized lenses for ultimate clarity.',
            sizes: accessoriesSizes,
            colors: JSON.stringify(['Gold/Black', 'Silver/Blue', 'Rose Gold'])
        },
        {
            oldName: 'Leather Handbag',
            newName: 'Vintage Tan Artisan Crossbody',
            description: 'Supple Italian leather meets vintage elegance. This compact crossbody is hand-stitched with a tan finish that develops a beautiful patina over time.',
            sizes: accessoriesSizes,
            colors: JSON.stringify(['Tan', 'Chocolate', 'Onyx'])
        },
        {
            oldName: 'Gold Bangle Set',
            newName: 'Minimalist Pearl & Gold Bangle',
            description: 'Delicate hand-forged gold bangles adorned with freshwater pearls. A minimalist yet powerful accessory for the modern woman.',
            sizes: accessoriesSizes,
            colors: JSON.stringify(['Gold', 'Silver', 'Rose Gold'])
        },

        // Shoes
        {
            oldName: 'Black Patent Leather Pumps',
            newName: 'Midnight Patent Stiletto Pumps',
            description: 'The ultimate power shoe. High-shine patent leather with a sleek 4-inch heel, designed for confidence and unparalleled style.',
            sizes: shoeSizes,
            colors: JSON.stringify(['Black', 'Nude', 'Navy'])
        },
        {
            oldName: 'Minimalist White Sneakers',
            newName: 'Urban Stealth White Sneakers',
            description: 'Luxury streetwear at its finest. Clean lines, premium calfskin leather, and a comfort-focused sole for the urban explorer.',
            sizes: shoeSizes,
            colors: JSON.stringify(['White', 'Off-White', 'Soft Grey'])
        },
        {
            oldName: 'Classic Brown Brogues',
            newName: 'Heritage Oxford Walnut Brogues',
            description: 'Traditional craftsmanship redefined. Walnut brown leather with intricate perforation details, offering a timeless heritage aesthetic.',
            sizes: shoeSizes,
            colors: JSON.stringify(['Walnut', 'Mahogany', 'Black'])
        },
        {
            oldName: 'Red Stiletto Heels',
            newName: 'Crimson Velvet High Stilettos',
            description: 'Command the room in these bold crimson velvet stilettos. A statement piece that combines sensual texture with a daring silhouette.',
            sizes: shoeSizes,
            colors: JSON.stringify(['Crimson', 'Deep Purple', 'Jet Black'])
        },

        // New AI Products (Refining if needed)
        {
            name: 'Noir Silk Evening Dress',
            sizes: defaultSizes,
            colors: JSON.stringify(['Black', 'Navy', 'Silver'])
        },
        {
            name: 'Manhattan Wool Overcoat',
            sizes: defaultSizes,
            colors: JSON.stringify(['Camel', 'Charcoal', 'Navy'])
        },
        {
            name: 'Luxe Accessories Collection',
            sizes: accessoriesSizes,
            colors: JSON.stringify(['Gold', 'Silver'])
        }
    ];

    for (const u of updates) {
        const query = u.oldName ? { name: u.oldName } : { name: u.name };
        const data = { ...u };
        delete data.oldName;
        if (u.newName) {
            data.name = u.newName;
            delete data.newName;
        }

        await prisma.product.updateMany({
            where: query,
            data
        });
        console.log(`Updated: ${u.oldName || u.name} -> ${data.name || u.name}`);
    }
    console.log('Done!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
