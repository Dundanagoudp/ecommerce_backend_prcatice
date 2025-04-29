const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Protected routes (require auth)
router.use(authMiddleware);

router.post('/add', CartController.addToCart);
router.get('/', CartController.getCart);
router.delete('/:productId', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

module.exports = router;