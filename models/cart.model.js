const mongoose = require("mongoose");
const User = require("../models/user.model");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceSnapshot: {
    type: Number,
    required: true
  },
  attributes: [
    {
      name: String,
      value: String
    }
  ],
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId ,
    ref: "User",
    required: true

  },
  items: [cartItemSchema],
  coupon: {
    code: {
      type: String,
      default: ""
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  shippingMethod: {
    type: String,
    default: ""
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

// Virtuals
cartSchema.virtual("subtotal").get(function() {
  return this.items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
});

cartSchema.virtual("total").get(function() {
  return this.subtotal - this.coupon.discount + this.shippingCost;
});

module.exports = mongoose.model("Cart", cartSchema);