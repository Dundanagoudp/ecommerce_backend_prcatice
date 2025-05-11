const CartService = require("../services/cart.services");

class CartController {
  async getCart(req, res) {
    try {
      const cart = await CartService.getCart(req.user._id);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  async addItem(req, res) {
    
    try {
      const cart = await CartService.addItem(req.user._id, req.body);
      res.json(cart);
    } catch (error) {
      if (error.message.includes("Product not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("errors")) {
        return res.status(400).json({ errors: JSON.parse(error.message) });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async updateItem(req, res) {
    try {
      const cart = await CartService.updateItem(
        req.user._id, 
        req.params.itemId, 
        req.body
      );
      res.json(cart);
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("errors")) {
        return res.status(400).json({ errors: JSON.parse(error.message) });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      const cart = await CartService.removeItem(req.user._id, req.params.itemId);
      res.json(cart);
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async clearCart(req, res) {
    try {
      const cart = await CartService.clearCart(req.user._id);
      res.json(cart);
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async applyCoupon(req, res) {
    try {
      const cart = await CartService.applyCoupon(req.user._id, req.body);
      res.json(cart);
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("errors")) {
        return res.status(400).json({ errors: JSON.parse(error.message) });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async updateShipping(req, res) {
    try {
      const cart = await CartService.updateShipping(req.user._id, req.body);
      res.json(cart);
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("errors")) {
        return res.status(400).json({ errors: JSON.parse(error.message) });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CartController();