const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const {
  validateCartItem,
  validateUpdateItem,
  validateCoupon,
  validateShipping
} = require("../validators/cart.validations");

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId })
      .populate("items.product", "name price sale_price images stock_status");
    
    if (!cart) {
      cart = new Cart({ user: userId });
      await cart.save();
    }
    
    return cart;
  }

  async addItem(userId, itemData) {
    const validation = validateCartItem(itemData);
    if (!validation.success) {
      throw new Error(JSON.stringify(validation.error.errors));
    }

    const { productId, quantity, attributes } = itemData;
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error("Product not found");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId });
    }

    const existingItem = cart.items.find(item => 
      item.product.equals(productId) && 
      JSON.stringify(item.attributes) === JSON.stringify(attributes || [])
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceSnapshot: product.sale_price || product.price,
        attributes: attributes || []
      });
    }

    await cart.save();
    return cart;
  }

  async updateItem(userId, itemId, updateData) {
    const validation = validateUpdateItem(updateData);
    if (!validation.success) {
      throw new Error(JSON.stringify(validation.error.errors));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new Error("Item not found in cart");
    }

    item.quantity = updateData.quantity;
    await cart.save();
    return cart;
  }

  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.items.pull(itemId);
    await cart.save();
    return cart;
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.items = [];
    cart.coupon = { code: "", discount: 0 };
    cart.shippingMethod = "";
    cart.shippingCost = 0;
    await cart.save();
    return cart;
  }

  async applyCoupon(userId, couponData) {
    const validation = validateCoupon(couponData);
    if (!validation.success) {
      throw new Error(JSON.stringify(validation.error.errors));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.coupon = { 
      code: couponData.couponCode || "", 
      discount: couponData.discount || 0 
    };
    await cart.save();
    return cart;
  }

  async updateShipping(userId, shippingData) {
    const validation = validateShipping(shippingData);
    if (!validation.success) {
      throw new Error(JSON.stringify(validation.error.errors));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.shippingMethod = shippingData.method || "";
    cart.shippingCost = shippingData.cost || 0;
    await cart.save();
    return cart;
  }
}

module.exports = new CartService();