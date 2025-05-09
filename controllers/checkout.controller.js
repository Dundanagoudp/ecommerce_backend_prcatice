const CheckoutService = require('../services/checkout.services');
const { checkoutValidator, paymentValidator } = require('../validators/checkout.validator');

class CheckoutController {
  static async startCheckout(req, res) {
    try {
      const { error } = checkoutValidator.body.validate(req.body);
      if (error) throw error;

      const checkout = await CheckoutService.initiateCheckout(
        req.user._id,
        req.user.cart, 
        req.body
      );

      res.status(201).json(checkout);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async handlePayment(req, res) {
    try {
      const { error } = paymentValidator.body.validate(req.body);
      if (error) throw error;

      const result = await CheckoutService.processPayment(
        req.params.checkoutId,
        req.body
      );

      if (!result.success) {
        return res.status(402).json({ error: 'Payment failed' });
      }

      res.json(result.checkout);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = CheckoutController;