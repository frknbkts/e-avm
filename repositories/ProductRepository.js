const prisma = require('../config/prisma');

class ProductRepository {
    async create(data) {
        return await prisma.product.create({
            data
        });
    }

    async findAll(includeDeleted = false) {
        return await prisma.product.findMany({
            where: includeDeleted ? {} : { isDeleted: false },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async findById(id) {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async update(id, data) {
        return await prisma.product.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return await prisma.product.update({
            where: { id },
            data: { isDeleted: true }
        });
    }

    async findByCategory(categoryId) {
        return await prisma.product.findMany({
            where: {
                categoryId,
                isDeleted: false
            },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
}

module.exports = new ProductRepository(); 