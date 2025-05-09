const Checkout = require('../models/checkout.model');
const Cart = require('../models/cart.model');

class CheckoutService {
  static async initiateCheckout(userId, cartId, checkoutData) {
    // 1. Validate cart exists
    const cart = await Cart.findById(cartId).populate('items.product');
    if (!cart) throw new Error('Cart not found');

    // 2. Freeze cart (prevent modifications)
    cart.isFrozen = true;
    await cart.save();

    // 3. Create checkout record
    return await Checkout.create({
      user: userId,
      cart: cartId,
      ...checkoutData,
      totalAmount: cart.total
    });
  }

  static async processPayment(checkoutId, paymentData) {
    const checkout = await Checkout.findById(checkoutId);
    
    // Payment processing simulation
    const paymentSuccess = Math.random() > 0.2; // 80% success rate for demo
    
    checkout.paymentStatus = paymentSuccess ? 'completed' : 'failed';
    await checkout.save();

    return {
      success: paymentSuccess,
      checkout
    };
  }
}

module.exports = CheckoutService;