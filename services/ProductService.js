const productRepository = require('../repositories/ProductRepository');
const prisma = require('../config/prisma');

class ProductService {
    // Admin kontrolü için yardımcı metod
    async checkAdminAccess(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.role !== 'ADMIN') {
            throw new Error('Admin yetkisi gerekli');
        }
    }

    async createProduct(data, userId) {
        try {
            await this.checkAdminAccess(userId);
            return await productRepository.create({
                ...data,
                userId // Ürünü ekleyen admin
            });
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    }

    async getAllProducts(includeDeleted = false) {
        try {
            return await productRepository.findAll(includeDeleted);
        } catch (error) {
            throw new Error(`Error fetching products: ${error.message}`);
        }
    }

    async getProductById(id) {
        try {
            const product = await productRepository.findById(parseInt(id));
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            throw new Error(`Error fetching product: ${error.message}`);
        }
    }

    async updateProduct(id, data, userId) {
        try {
            await this.checkAdminAccess(userId);
            const product = await productRepository.findById(parseInt(id));
            if (!product) {
                throw new Error('Product not found');
            }
            return await productRepository.update(parseInt(id), data);
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    async deleteProduct(id, userId) {
        try {
            await this.checkAdminAccess(userId);
            const product = await productRepository.findById(parseInt(id));
            if (!product) {
                throw new Error('Product not found');
            }
            return await productRepository.delete(parseInt(id));
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }

    async getProductsByCategory(categoryId) {
        try {
            return await productRepository.findByCategory(parseInt(categoryId));
        } catch (error) {
            throw new Error(`Error fetching products by category: ${error.message}`);
        }
    }

    // Sepet işlemleri için yeni metodlar
    async addToCart(userId, productId, quantity = 1) {
        try {
            // Ürünün stokta olup olmadığını kontrol et
            const product = await this.getProductById(productId);
            if (product.stock < quantity) {
                throw new Error('Yetersiz stok');
            }

            // Kullanıcının sepeti var mı kontrol et, yoksa oluştur
            let cart = await prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: { userId }
                });
            }

            // Ürün sepette var mı kontrol et
            const existingItem = await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId
                    }
                }
            });

            if (existingItem) {
                // Varsa miktarını güncelle
                return await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + quantity }
                });
            } else {
                // Yoksa yeni ekle
                return await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity
                    }
                });
            }
        } catch (error) {
            throw new Error(`Error adding to cart: ${error.message}`);
        }
    }

    async removeFromCart(userId, productId) {
        try {
            const cart = await prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                throw new Error('Sepet bulunamadı');
            }

            return await prisma.cartItem.delete({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId
                    }
                }
            });
        } catch (error) {
            throw new Error(`Error removing from cart: ${error.message}`);
        }
    }

    async getCart(userId) {
        try {
            const cart = await prisma.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!cart) {
                throw new Error('Sepet bulunamadı');
            }

            return cart;
        } catch (error) {
            throw new Error(`Error fetching cart: ${error.message}`);
        }
    }

    async updateCartItemQuantity(userId, productId, quantity) {
        try {
            const cart = await prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                throw new Error('Sepet bulunamadı');
            }

            // Ürünün stokta olup olmadığını kontrol et
            const product = await this.getProductById(productId);
            if (product.stock < quantity) {
                throw new Error('Yetersiz stok');
            }

            return await prisma.cartItem.update({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId
                    }
                },
                data: { quantity }
            });
        } catch (error) {
            throw new Error(`Error updating cart item quantity: ${error.message}`);
        }
    }
}

module.exports = new ProductService(); 