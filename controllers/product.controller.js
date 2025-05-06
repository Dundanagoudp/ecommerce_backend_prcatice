const productService = require("../services/product.services");
const { uploadToFirebase } = require("../firbaseimagestorge/products.storge");
const productServices = require("../services/product.services");

exports.createProduct = async (req, res) => {
  try {
    let productData = req.body;

    // Convert string fields to arrays if needed
    if (typeof productData.categories === 'string') {
      productData.categories = productData.categories.split(',').map(id => id.trim());
    }
    if (typeof productData.sub_categories === 'string') {
      productData.sub_categories = productData.sub_categories.split(',').map(id => id.trim());
    }
    if (typeof productData.tags === 'string') {
      productData.tags = productData.tags.split(',').map(tag => tag.trim());
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = req.files.map(async (file) => {
        try {
          const firebaseData = await uploadToFirebase(file);
          return {
            url: firebaseData.publicUrl,
            alt_text: file.originalname,
            is_featured: false
          };
        } catch (error) {
          console.error(`Failed to upload image ${file.originalname}:`, error);
          return null;
        }
      });

      const imageResults = await Promise.all(imageUploadPromises);
      productData.images = imageResults.filter(img => img !== null);
      
      if (productData.images.length > 0) {
        productData.images[0].is_featured = true; // First image is featured
      }
    }

    const product = await productService.createProduct(productData);
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create product"
    });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      subCategory,
      minPrice,
      maxPrice,
      search,
      featured,
      sortBy,
      sortOrder
    } = req.query;

    const products = await productService.getAllProducts({
      page,
      limit,
      category,
      subCategory,
      minPrice,
      maxPrice,
      search,
      featured,
      sortBy,
      sortOrder
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error.message === "Product not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let updateData = req.body;

    // Parse string fields to arrays if needed
    if (typeof updateData.categories === 'string') {
      updateData.categories = updateData.categories.split(',').map(id => id.trim());
    }
    if (typeof updateData.sub_categories === 'string') {
      updateData.sub_categories = updateData.sub_categories.split(',').map(id => id.trim());
    }
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const firebaseData = await uploadToFirebase(file);
        if (firebaseData.publicUrl) {
          imageUrls.push({
            url: firebaseData.publicUrl,
            alt_text: file.originalname,
            is_featured: imageUrls.length === 0,
          });
        }
      }
      // If updating images, replace all existing images
      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
      }
    }

    const product = await productService.updateProduct(req.params.id, updateData);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.message === "Product not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

exports.softDeleteProduct = async (req, res) => {
  try {
    const product = await productService.softDeleteProduct(req.params.id);
    res.status(200).json({ message: "Product soft-deleted successfully", product });
  } catch (error) {
    console.error("Error soft-deleting product:", error);
    if (error.message === "Product not found") {
      res.status(404).json({ error: error.message });
    } else if (error.message === "Product is already deleted") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.message === "Product not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await productService.getProductsByCategory(
      req.params.categoryId,
      { page, limit }
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get search products
// Add to product.controller.js
exports.searchProducts = async (req, res) => {
  try {
    const {
      q = '',
      category = [],
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 10,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    const results = await productServices.searchProducts({
      q,
      category,
      minPrice,
      maxPrice,
      inStock: inStock === 'true',
      page,
      limit,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to search products"
    });
  }
};

//auto complete search
exports.autocomplete = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    const results = await productService.autocomplete(q, limit);
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Error in autocomplete:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform autocomplete"
    });
  }
};


exports.getFeaturedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await productService.getFeaturedProducts({ page, limit });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};