const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'kingkenzy237@gmail.com';
    const adminPass = process.env.ADMIN_PASS || 'P1bugatti';

    // Upsert Admin - delete all old admins and create with new credentials
    await prisma.admin.deleteMany({});
    const hashedPassword = await bcrypt.hash(adminPass, 10);
    await prisma.admin.create({
        data: {
            email: adminEmail,
            password: hashedPassword
        }
    });
    console.log(`Admin user seeded: ${adminEmail}`);

    // Seed Initial Products if empty
    const productCount = await prisma.product.count();
    if (productCount === 0) {
        const products = [
            { name: 'Fallon Dress', price: 168.00, brand: 'Signature', imagePath: '/pictures/posts/pexels-enginakyurt-1642228.jpg', description: 'Elegant fall dress with a modern silhouette.', category: 'Clothing' },
            { name: 'Malla Dress', price: 518.00, brand: 'Premium', imagePath: '/pictures/posts/pexels-lum3n-44775-322207.jpg', description: 'A luxury statement piece for formal occasions.', category: 'Clothing' },
            { name: 'Siena Silk Scarf', price: 85.00, brand: 'Accessories', imagePath: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', description: 'Handcrafted silk scarf with intricate patterns.', category: 'Accessories' },
            { name: 'Celine Wool Coat', price: 890.00, brand: 'Outerwear', imagePath: 'https://images.unsplash.com/photo-1539533727851-6391147ad7ad?w=800', description: 'Premium wool coat for timeless style and warmth.', category: 'Clothing' },
            { name: 'Noir Silk Evening Dress', price: 425.00, brand: 'Signature', imagePath: '/pictures/posts/luxury-silk-dress.png', description: 'A stunning black silk evening dress with delicate draping and a modern silhouette. Perfect for galas and formal events.', category: 'New Arrivals' },
            { name: 'Manhattan Wool Overcoat', price: 950.00, brand: 'Premium', imagePath: '/pictures/posts/designer-wool-coat.png', description: 'Premium camel wool overcoat. Crafted for warmth and timeless NYC sophistication.', category: 'Clothing' },
            { name: 'Luxe Accessories Collection', price: 295.00, brand: 'Accessories', imagePath: '/pictures/posts/luxury-accessories-set.png', description: 'Curated luxury set: burgundy silk scarf, cream leather handbag, and gold minimalist jewelry.', category: 'Accessories' }
        ];

        for (const p of products) {
            await prisma.product.create({ data: p });
        }
        console.log('Sample products seeded successfully.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
