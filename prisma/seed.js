const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    // Örnek kullanıcılar
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: await bcrypt.hash('admin123', 10),
            role: 'ADMIN'
        },
    });

    const customerUser = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            name: 'Test Customer',
            password: await bcrypt.hash('customer123', 10),
            role: 'USER',
            addresses: {
                create: {
                    title: 'Ev',
                    fullName: 'Test Customer',
                    phone: '5551234567',
                    city: 'İstanbul',
                    district: 'Kadıköy',
                    address: 'Örnek Mahallesi, Test Sokak No:1 D:2',
                    isDefault: true
                }
            }
        },
    });

    // Örnek kategoriler
    const elektronikKategori = await prisma.category.upsert({
        where: { name: 'Elektronik' },
        update: {},
        create: {
            name: 'Elektronik',
            description: 'Elektronik ürünler'
        },
    });

    const telefonKategori = await prisma.category.upsert({
        where: { name: 'Telefonlar' },
        update: {},
        create: {
            name: 'Telefonlar',
            description: 'Akıllı telefonlar ve aksesuarları',
            parentId: elektronikKategori.id
        },
    });

    const giyimKategori = await prisma.category.upsert({
        where: { name: 'Giyim' },
        update: {},
        create: {
            name: 'Giyim',
            description: 'Giyim ürünleri'
        },
    });

    // Örnek ürünler
    const iphone = await prisma.product.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'iPhone 14 Pro',
            price: 49999.99,
            stock: 50,
            description: '256GB, Uzay Siyahı',
            userId: adminUser.id,
            categoryId: telefonKategori.id,
            images: {
                create: {
                    url: 'https://example.com/iphone14pro.jpg',
                    isMain: true
                }
            }
        },
    });

    const samsung = await prisma.product.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Samsung Galaxy S23 Ultra',
            price: 44999.99,
            stock: 30,
            description: '512GB, Phantom Black',
            userId: adminUser.id,
            categoryId: telefonKategori.id,
            images: {
                create: {
                    url: 'https://example.com/s23ultra.jpg',
                    isMain: true
                }
            }
        },
    });

    const tshirt = await prisma.product.upsert({
        where: { id: 3 },
        update: {},
        create: {
            name: 'Basic T-Shirt',
            price: 199.99,
            stock: 100,
            description: 'Pamuklu Basic T-Shirt, Siyah',
            userId: adminUser.id,
            categoryId: giyimKategori.id,
            images: {
                create: {
                    url: 'https://example.com/tshirt.jpg',
                    isMain: true
                }
            }
        },
    });

    // Örnek yorumlar
    await prisma.productReview.create({
        data: {
            rating: 5,
            comment: 'Harika bir telefon, çok memnun kaldım!',
            userId: customerUser.id,
            productId: iphone.id
        }
    });

    await prisma.productReview.create({
        data: {
            rating: 4,
            comment: 'Kaliteli bir ürün ama biraz pahalı',
            userId: customerUser.id,
            productId: samsung.id
        }
    });

    console.log('Seed data oluşturuldu 🌱');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 