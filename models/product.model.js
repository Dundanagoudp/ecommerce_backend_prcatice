const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2"); 

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
    default: () =>
      Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    minlength: [3, "Product name must be at least 3 characters"],
    maxlength: [100, "Product name must be less than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters"],
  },
  short_description: {
    type: String,
    trim: true,
    maxlength: [200, "Short description must be less than 200 characters"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
 // In product.model.js
sale_price: {
  type: Number,
  min: [0, "Sale price cannot be negative"],
  validate: {
    validator: function(v) {
      // Skip validation if sale_price is not provided or is null/undefined
      if (v == null) return true;
      
      // Compare with the current price (this.price) or the new price if being updated
      const regularPrice = this.price !== undefined ? this.price : this._update.$set?.price;
      return v < regularPrice;
    },
    message: function(props) {
      const regularPrice = this.price !== undefined ? this.price : this._update.$set?.price;
      return `Sale price ${props.value} must be less than regular price ${regularPrice}`;
    }
  }
},
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  stock_quantity: {
    type: Number,
    default: 0,
    min: [0, "Stock quantity cannot be negative"],
  },
  stock_status: {
    type: String,
    enum: ["in_stock", "out_of_stock", "on_backorder"],
    default: "in_stock",
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "At least one category is required"],
    },
  ],
  sub_categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
  ],
  images: [
    {
      url: {
        type: String,
        required: true,
        validate: {
          validator: (v) =>
            /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/.test(v),
          message: "Invalid URL format for product image",
        },
      },
      alt_text: String,
      is_featured: Boolean,
    },
  ],
  weight: {
    type: Number,
    min: [0, "Weight cannot be negative"],
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  attributes: [
    {
      name: String,
      value: String,
    },
  ],
  tags: [String],
  is_featured: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// ✅ Text index for searching
productSchema.index({ name: "text", description: "text", short_description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ stock_status: 1 });
productSchema.index({ is_featured: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ sub_categories: 1 });

productSchema.virtual("on_sale").get(function () {
  return this.sale_price && this.sale_price < this.price;
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", productSchema);
