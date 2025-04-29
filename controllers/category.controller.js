const Category = require("../models/category.model");
const mongoose = require("mongoose");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const category = await Category.findOne({ _id: id, isDeleted: false });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { category_name, category_des, visibility } = req.body;

    if (!req.firebaseData?.publicUrl) {
      return res.status(400).json({ error: "Failed to upload image" });
    }

    const newCategory = new Category({
      category_name,
      category_des,
      category_image: req.firebaseData.publicUrl,
      visibility: visibility === 'true',
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error adding category:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Category name already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { category_name, category_des, visibility, remove_image } = req.body;

    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category_name) {
      const nameConflict = await Category.findOne({ category_name, _id: { $ne: req.params.id } });
      if (nameConflict) {
        return res.status(400).json({ error: "Another category with this name already exists" });
      }
    }

    let category_image = existingCategory.category_image;
    if (req.firebaseData?.publicUrl) {
      category_image = req.firebaseData.publicUrl;
    } else if (remove_image === 'true') {
      category_image = null;
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
      category_name: category_name ?? existingCategory.category_name,
      category_des: category_des ?? existingCategory.category_des,
      category_image,
      visibility: visibility !== undefined ? (visibility === 'true') : existingCategory.visibility,
    }, { new: true });

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.markAsDeleted = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category.isDeleted) {
      return res.status(400).json({ error: "Category is already deleted" });
    }

    category.isDeleted = true;
    await category.save();

    res.status(200).json({ message: "Category soft-deleted successfully" });
  } catch (error) {
    console.error("Error soft-deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
