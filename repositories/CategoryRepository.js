const prisma = require('../config/prisma');

class CategoryRepository {
    async create(data) {
        return await prisma.category.create({
            data
        });
    }

    async findAll(includeDeleted = false) {
        return await prisma.category.findMany({
            where: includeDeleted ? {} : { isDeleted: false },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true }
                }
            }
        });
    }

    async findById(id) {
        return await prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                products: {
                    where: { isDeleted: false },
                    include: {
                        images: true,
                        reviews: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    async update(id, data) {
        return await prisma.category.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return await prisma.category.update({
            where: { id },
            data: { isDeleted: true }
        });
    }

    async findChildren(parentId) {
        return await prisma.category.findMany({
            where: {
                parentId,
                isDeleted: false
            }
        });
    }

    async findByName(name) {
        return await prisma.category.findFirst({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                },
                isDeleted: false
            }
        });
    }
}

module.exports = new CategoryRepository(); 