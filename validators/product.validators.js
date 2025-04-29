const { body, validationResult, param, query } = require('express-validator');
const mongoose = require('mongoose');
const Category = require('../models/category.model');
const SubCategory = require('../models/subCategory.model');

exports.validateProductData = [
  // Basic product info validation
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3 }).withMessage('Product name must be at least 3 characters')
    .isLength({ max: 100 }).withMessage('Product name must be less than 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Product description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  body('short_description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Short description must be less than 200 characters'),

  // Pricing validation
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('sale_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number')
    .custom((value, { req }) => {
      if (value && parseFloat(value) >= parseFloat(req.body.price)) {
        throw new Error('Sale price must be less than regular price');
      }
      return true;
    }),

  // Inventory validation
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),

  body('stock_status')
    .optional()
    .isIn(['in_stock', 'out_of_stock', 'on_backorder']).withMessage('Invalid stock status'),

  // Category validation
  body('categories')
    .notEmpty().withMessage('At least one category is required')
    .isArray().withMessage('Categories must be an array')
    .custom(async (value) => {
      const validCategories = await Category.countDocuments({
        _id: { $in: value },
        isDeleted: false
      });
      
      if (validCategories !== value.length) {
        throw new Error('One or more categories are invalid or deleted');
      }
      return true;
    }),

  // Subcategory validation
  body('sub_categories')
    .optional()
    .isArray().withMessage('Subcategories must be an array')
    .custom(async (value) => {
      if (value && value.length > 0) {
        const validSubCategories = await SubCategory.countDocuments({
          _id: { $in: value },
          isDeleted: false
        });
        
        if (validSubCategories !== value.length) {
          throw new Error('One or more subcategories are invalid or deleted');
        }
      }
      return true;
    }),

  // Image validation
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array')
    .custom((images) => {
      if (images && images.length > 5) {
        throw new Error('Maximum 5 images allowed');
      }
      return true;
    }),

  // Dimensions validation
  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 }).withMessage('Length must be a positive number'),

  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 }).withMessage('Width must be a positive number'),

  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 }).withMessage('Height must be a positive number'),

  // Weight validation
  body('weight')
    .optional()
    .isFloat({ min: 0 }).withMessage('Weight must be a positive number'),

  // Tags validation
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validate product ID parameter
exports.validateProductId = [
  param('id')
    .notEmpty().withMessage('Product ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid product ID format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validate category ID parameter
exports.validateCategoryId = [
  param('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid category ID format')
    .custom(async (value) => {
      const category = await Category.findOne({ _id: value, isDeleted: false });
      if (!category) {
        throw new Error('Category not found or has been deleted');
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware to parse comma-separated strings to arrays
exports.parseArrayFields = (req, res, next) => {
  if (req.body.categories && typeof req.body.categories === 'string') {
    req.body.categories = req.body.categories.split(',').map(id => id.trim());
  }
  
  if (req.body.sub_categories && typeof req.body.sub_categories === 'string') {
    req.body.sub_categories = req.body.sub_categories.split(',').map(id => id.trim());
  }
  
  if (req.body.tags && typeof req.body.tags === 'string') {
    req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
  }
  
  next();
};

// Middleware to set default values
exports.setProductDefaults = (req, res, next) => {
  if (req.method === 'POST') {
    req.body.is_active = req.body.is_active !== undefined ? req.body.is_active : true;
    req.body.is_featured = req.body.is_featured !== undefined ? req.body.is_featured : false;
    req.body.stock_status = req.body.stock_status || 'in_stock';
    req.body.stock_quantity = req.body.stock_quantity || 0;
  }
  next();
};

// Query parameter validation for getAllProducts
exports.validateProductQueryParams = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  query('featured').optional().isIn(['true', 'false']).withMessage('Featured must be true or false'),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];