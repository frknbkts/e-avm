const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');
const authMiddleware = require('../middlewares/auth');

// Public routes
router.post('/register', accountController.register);
router.post('/login', accountController.login);

// Protected routes
router.use(authMiddleware);
router.put('/profile', accountController.updateProfile);
router.put('/password', accountController.changePassword);
router.get('/addresses', accountController.getAddresses);
router.post('/addresses', accountController.addAddress);
router.put('/addresses/:id', accountController.updateAddress);
router.delete('/addresses/:id', accountController.deleteAddress);
router.put('/addresses/:id/default', accountController.setDefaultAddress);

module.exports = router;
