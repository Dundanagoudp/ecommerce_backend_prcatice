const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    default: () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
  },
  category_name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
    unique: true,
    minlength: [3, "Category name must be at least 3 characters long"],
    maxlength: [100, "Category name must be less than 100 characters"],
  },
  category_des: {
    type: String,
    required: [true, "Category description is required"],
    trim: true,
    minlength: [5, "Category description must be at least 5 characters long"],
  },
  category_image: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/.test(v),
      message: "Invalid URL format for category image",
    },
  },
  visibility: {
    type: Boolean,
    required: true,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  selected_sub_category_ref: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  }],
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
