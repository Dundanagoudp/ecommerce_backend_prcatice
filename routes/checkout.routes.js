const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', checkoutController.startCheckout);
router.post('/:checkoutId/payment', checkoutController.handlePayment);

module.exports = router;