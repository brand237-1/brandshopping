const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = [
        // Accessories
        {
            name: 'Luxury Silk Scarf',
            brand: 'Signature',
            price: 120.00,
            category: 'Accessories',
            description: 'Handcrafted premium silk scarf with a timeless pattern.',
            imagePath: '/pictures/assesories/pexels-karola-g-4210339.jpg'
        },
        {
            name: 'Designer Sunglasses',
            brand: 'Premium',
            price: 350.00,
            category: 'Accessories',
            description: 'Sleek black frame sunglasses with gold accents and UV protection.',
            imagePath: '/pictures/assesories/pexels-pixabay-274973.jpg'
        },
        {
            name: 'Leather Handbag',
            brand: 'Artisan',
            price: 850.00,
            category: 'Accessories',
            description: 'Italian leather handbag with a minimalist aesthetic.',
            imagePath: '/pictures/assesories/pexels-nurgul-kelebek-83496198-9566338.jpg'
        },
        {
            name: 'Gold Bangle Set',
            brand: 'Gild',
            price: 450.00,
            category: 'Accessories',
            description: '18k gold-plated bangle set for a sophisticated look.',
            imagePath: '/pictures/assesories/pexels-suzyhazelwood-1266139.jpg'
        },

        // Gift Cards
        {
            name: 'Birthday Gift Card',
            brand: 'BrandshoppingLTD',
            price: 50.00,
            category: 'Gift Cards',
            description: 'The perfect gift for a special celebration.',
            imagePath: '/pictures/gift cards/pexels-june-1528673-5404193.jpg'
        },
        {
            name: 'Luxury Shopping Credit',
            brand: 'BrandshoppingLTD',
            price: 500.00,
            category: 'Gift Cards',
            description: 'A premium credit for a high-end shopping experience.',
            imagePath: '/pictures/gift cards/pexels-rdne-7763939.jpg'
        },
        {
            name: 'Anniversary Gift Voucher',
            brand: 'BrandshoppingLTD',
            price: 250.00,
            category: 'Gift Cards',
            description: 'Celebrate love with the gift of choice.',
            imagePath: '/pictures/gift cards/pexels-rdne-7763967.jpg'
        },
        {
            name: 'Corporate Gift Card',
            brand: 'BrandshoppingLTD',
            price: 100.00,
            category: 'Gift Cards',
            description: 'The ideal reward for professional achievement.',
            imagePath: '/pictures/gift cards/pexels-rdne-7764535.jpg'
        },

        // Shoes
        {
            name: 'Black Patent Leather Pumps',
            brand: 'Heel & Sole',
            price: 650.00,
            category: 'Shoes',
            description: 'Classic patent leather pumps for a powerful silhouette.',
            imagePath: '/pictures/shoes/pexels-godisable-jacob-226636-977912.jpg'
        },
        {
            name: 'Minimalist White Sneakers',
            brand: 'Urban',
            price: 280.00,
            category: 'Shoes',
            description: 'Premium leather sneakers for effortless street style.',
            imagePath: '/pictures/shoes/pexels-melvin-buezo-1253763-2529148.jpg'
        },
        {
            name: 'Classic Brown Brogues',
            brand: 'Heritage',
            price: 420.00,
            category: 'Shoes',
            description: 'Hand-finished leather brogues with a traditional look.',
            imagePath: '/pictures/shoes/pexels-amanjakhar-2048548.jpg'
        },
        {
            name: 'Red Stiletto Heels',
            brand: 'Vibrant',
            price: 750.00,
            category: 'Shoes',
            description: 'Bold red stiletto heels that command attention.',
            imagePath: '/pictures/shoes/pexels-pixabay-267301.jpg'
        }
    ];

    for (const p of products) {
        const exists = await prisma.product.findFirst({ where: { name: p.name } });
        if (!exists) {
            await prisma.product.create({ data: p });
            console.log(`Added: ${p.name}`);
        } else {
            console.log(`Already exists: ${p.name}`);
        }
    }
    console.log('Done!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
