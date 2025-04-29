const User = require('../models/user.model');
const Product = require('../models/product.model');

class CartController {
  // Add to Cart
  static async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;

      // Validate product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: "Product not found" 
        });
      }

      // Update user's cart
      const user = await User.findById(req.user._id);
      const existingItem = user.cart.find(item => 
        item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        user.cart.push({ product: productId, quantity });
      }

      await user.save();

      res.status(200).json({
        success: true,
        data: await user.populate('cart.product', 'title price images')
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to update cart",
        error: error.message 
      });
    }
  }

  // Get Cart
  static async getCart(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate('cart.product', 'title price images category');
      
      res.status(200).json({
        success: true,
        data: user.cart
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch cart" 
      });
    }
  }

  // Remove from Cart
  static async removeFromCart(req, res) {
    try {
      const user = await User.findById(req.user._id);
      user.cart = user.cart.filter(
        item => item.product.toString() !== req.params.productId
      );
      
      await user.save();
      res.status(200).json({
        success: true,
        data: await user.populate('cart.product', 'title price images')
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to remove item" 
      });
    }
  }

  // Clear Cart
  static async clearCart(req, res) {
    try {
      const user = await User.findById(req.user._id);
      user.cart = [];
      await user.save();
      res.status(200).json({ 
        success: true, 
        message: "Cart cleared" 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to clear cart" 
      });
    }
  }
}

module.exports = CartController;