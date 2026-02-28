require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = [
        {
            name: 'Engin Designer Peacoat',
            brand: 'Signature',
            price: 245.00,
            oldPrice: 320.00,
            category: 'Clothing',
            description: 'A luxurious, high-end peacoat for the discerning fashionista.',
            imagePath: '/pictures/posts/pexels-enginakyurt-1642228.jpg'
        },
        {
            name: 'Lumen Silk Blouse',
            brand: 'Premium',
            price: 185.00,
            oldPrice: null,
            category: 'Clothing',
            description: 'Elegant silk blouse with a smooth finish and tailored fit.',
            imagePath: '/pictures/posts/pexels-lum3n-44775-322207.jpg'
        }
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }
    console.log('Successfully posted new products.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
