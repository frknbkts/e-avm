const productService = require('../services/ProductService');

class ProductController {
    async createProduct(req, res) {
        try {
            const product = await productService.createProduct(req.body, req.user.id);
            res.status(201).json(product);
        } catch (error) {
            if (error.message === 'Admin yetkisi gerekli') {
                res.status(403).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async getAllProducts(req, res) {
        try {
            const includeDeleted = req.query.includeDeleted === 'true' && req.user.role === 'ADMIN';
            const products = await productService.getAllProducts(includeDeleted);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);
            res.json(product);
        } catch (error) {
            if (error.message === 'Product not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async updateProduct(req, res) {
        try {
            const product = await productService.updateProduct(req.params.id, req.body, req.user.id);
            res.json(product);
        } catch (error) {
            if (error.message === 'Admin yetkisi gerekli') {
                res.status(403).json({ error: error.message });
            } else if (error.message === 'Product not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async deleteProduct(req, res) {
        try {
            await productService.deleteProduct(req.params.id, req.user.id);
            res.status(204).send();
        } catch (error) {
            if (error.message === 'Admin yetkisi gerekli') {
                res.status(403).json({ error: error.message });
            } else if (error.message === 'Product not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async getProductsByCategory(req, res) {
        try {
            const products = await productService.getProductsByCategory(req.params.categoryId);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            const cartItem = await productService.addToCart(req.user.id, parseInt(productId), quantity);
            res.status(201).json(cartItem);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeFromCart(req, res) {
        try {
            await productService.removeFromCart(req.user.id, parseInt(req.params.productId));
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getCart(req, res) {
        try {
            const cart = await productService.getCart(req.user.id);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateCartItemQuantity(req, res) {
        try {
            const { quantity } = req.body;
            const cartItem = await productService.updateCartItemQuantity(
                req.user.id,
                parseInt(req.params.productId),
                quantity
            );
            res.json(cartItem);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new ProductController(); 