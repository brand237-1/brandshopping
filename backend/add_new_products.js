const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const newProducts = [
        { name: 'Noir Silk Evening Dress', price: 425.00, brand: 'Signature', imagePath: '/pictures/posts/luxury-silk-dress.png', description: 'A stunning black silk evening dress with delicate draping and a modern silhouette. Perfect for galas and formal events.', category: 'New Arrivals' },
        { name: 'Manhattan Wool Overcoat', price: 950.00, brand: 'Premium', imagePath: '/pictures/posts/designer-wool-coat.png', description: 'Premium camel wool overcoat. Crafted for warmth and timeless NYC sophistication.', category: 'Clothing' },
        { name: 'Luxe Accessories Collection', price: 295.00, brand: 'Accessories', imagePath: '/pictures/posts/luxury-accessories-set.png', description: 'Curated luxury set: burgundy silk scarf, cream leather handbag, and gold minimalist jewelry.', category: 'Accessories' }
    ];

    for (const p of newProducts) {
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
