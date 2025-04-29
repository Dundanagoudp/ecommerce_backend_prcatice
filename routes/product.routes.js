const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { upload } = require("../firbaseimagestorge/products.storge");
const productValidator = require("../validators/product.validators");

// Create a new product
router.post(
  "/create",
  upload.array("images", 5), 
  productValidator.parseArrayFields,
  productValidator.setProductDefaults,
  productValidator.validateProductData,
  productController.createProduct
);

// Get all products
router.get("/getallproducts", productController.getAllProducts);

// Get product by ID
router.get(
  "/:id",
  productValidator.validateProductId,
  productController.getProductById
);

// Update product
router.put(
  "/:id",
  upload.array("images", 5),
  productValidator.parseArrayFields,
  productValidator.validateProductId,
  productValidator.validateProductData,
  productController.updateProduct
);

// Soft delete product
router.delete(
  "/markas-delete/:id",
  productValidator.validateProductId,
  productController.softDeleteProduct
);

// Hard delete product///
router.delete(
  "/:id",
  productValidator.validateProductId,
  productController.deleteProduct
);

// Get products by category
router.get(
  "/category/:categoryId",
  productValidator.validateCategoryId,
  productController.getProductsByCategory
);

// Get featured products
router.get("/featured/products", productController.getFeaturedProducts);

module.exports = router;