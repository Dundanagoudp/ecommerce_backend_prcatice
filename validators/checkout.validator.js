const { z } = require('zod');

const checkoutValidator = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().min(2),
      zipCode: z.string().min(5),
      country: z.string().min(2)
    }),
    paymentMethod: z.enum(['credit_card', 'paypal', 'stripe'])
  })
});

const paymentValidator = z.object({
  body: z.object({
    token: z.string().min(10),
    amount: z.number().positive()
  })
});

module.exports = { checkoutValidator, paymentValidator };