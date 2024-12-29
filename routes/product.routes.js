const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const authMiddleware = require('../middlewares/auth');

// Public routes - Herkes erişebilir
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:categoryId', productController.getProductsByCategory);

// Protected routes - Sadece giriş yapanlar erişebilir
router.use(authMiddleware);

// Admin işlemleri
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Sepet işlemleri
router.post('/cart', productController.addToCart);
router.delete('/cart/:productId', productController.removeFromCart);
router.get('/cart/my', productController.getCart);
router.put('/cart/:productId', productController.updateCartItemQuantity);

module.exports = router; 