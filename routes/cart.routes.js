const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// Cart routes
router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.put("/items/:itemId", cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clearCart);
router.post("/coupon", cartController.applyCoupon);
router.put("/shipping", cartController.updateShipping);

module.exports = router;