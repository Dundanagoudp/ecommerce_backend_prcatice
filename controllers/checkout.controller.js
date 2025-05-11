const CheckoutService = require('../services/checkout.services');
const { checkoutSchema, paymentSchema } = require('../validators/checkout.validator');

class CheckoutController {
  static async startCheckout(req, res) {
    try {
      // Zod validation
      const validatedData = checkoutSchema.parse(req.body);
      
      const checkout = await CheckoutService.initiateCheckout(
        req.user._id,
        req.user.cart, 
        validatedData 
      );

      res.status(201).json(checkout);
    } catch (error) {
      // Zod error formatting
      if (error.errors) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      res.status(400).json({ error: error.message });
    }
  }

  static async handlePayment(req, res) {
    try {
      // Zod validation
      const validatedData = paymentSchema.parse(req.body);
      
      const result = await CheckoutService.processPayment(
        req.params.checkoutId,
        validatedData
      );

      if (!result.success) {
        return res.status(402).json({ error: 'Payment failed' });
      }

      res.json(result.checkout);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ 
          error: 'Payment validation failed',
          details: error.errors 
        });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = CheckoutController;