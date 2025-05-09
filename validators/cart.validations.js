const { z } = require("zod");

const validateCartItem = (data) => {
  const schema = z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
    attributes: z.array(
      z.object({
        name: z.string().optional(),
        value: z.string().optional()
      })
    ).optional()
  });
  
  return schema.safeParse(data);
};

const validateUpdateItem = (data) => {
  const schema = z.object({
    quantity: z.number().min(1)
  });
  
  return schema.safeParse(data);
};

const validateCoupon = (data) => {
  const schema = z.object({
    couponCode: z.string().optional(),
    discount: z.number().min(0).optional()
  });
  
  return schema.safeParse(data);
};

const validateShipping = (data) => {
  const schema = z.object({
    method: z.string().optional(),
    cost: z.number().min(0).optional()
  });
  
  return schema.safeParse(data);
};

module.exports = {
  validateCartItem,
  validateUpdateItem,
  validateCoupon,
  validateShipping
};