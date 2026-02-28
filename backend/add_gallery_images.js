const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updates = [
        {
            name: 'Noir Silk Evening Dress',
            gallery: JSON.stringify([
                '/pictures/posts/luxury-silk-dress.png',
                '/pictures/posts/silk-dress-1.png',
                '/pictures/posts/silk-dress-2.png'
            ])
        },
        {
            name: 'Manhattan Wool Overcoat',
            gallery: JSON.stringify([
                '/pictures/posts/designer-wool-coat.png',
                '/pictures/posts/wool-coat-1.png',
                '/pictures/posts/wool-coat-2.png'
            ])
        },
        {
            name: 'Luxe Accessories Collection',
            gallery: JSON.stringify([
                '/pictures/posts/luxury-accessories-set.png',
                '/pictures/posts/accessories-1.png',
                '/pictures/posts/accessories-2.png'
            ])
        }
    ];

    for (const update of updates) {
        await prisma.product.updateMany({
            where: { name: update.name },
            data: { gallery: update.gallery }
        });
        console.log(`Updated gallery for: ${update.name}`);
    }
    console.log('Done!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
