const Product = require("../models/product.model");
const Category = require("../models/category.model");
const SubCategory = require("../models/subCategory.model");

class ProductService {
  // Create a new product
  async createProduct(productData) {
    // Validate categories
    const categories = await Category.find({
      _id: { $in: productData.categories },
      isDeleted: false
    });
    
    if (categories.length !== productData.categories.length) {
      throw new Error("One or more categories not found or deleted");
    }

    // Validate subcategories if provided
    if (productData.sub_categories && productData.sub_categories.length > 0) {
      const subCategories = await SubCategory.find({
        _id: { $in: productData.sub_categories },
        isDeleted: false
      });
      
      if (subCategories.length !== productData.sub_categories.length) {
        throw new Error("One or more subcategories not found or deleted");
      }
    }

    // Set default stock status based on quantity
    if (productData.stock_quantity === undefined) {
      productData.stock_quantity = 0;
    }
    if (!productData.stock_status) {
      productData.stock_status = productData.stock_quantity > 0 ? 'in_stock' : 'out_of_stock';
    }

    const product = new Product(productData);
    return await product.save();
  }
  

  // Get all products with optional filters
  async getAllProducts({ 
    page = 1, 
    limit = 10, 
    category, 
    subCategory, 
    minPrice, 
    maxPrice, 
    search, 
    featured,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) {
    const query = { isDeleted: false };

    if (category) {
      query.categories = category;
    }

    if (subCategory) {
      query.sub_categories = subCategory;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (featured !== undefined) {
      query.is_featured = featured === "true";
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: ["categories", "sub_categories"],
    };

    return await Product.paginate(query, options);
  }

  // Get product by ID
  async getProductById(id) {
    const product = await Product.findById(id)
      .populate("categories")
      .populate("sub_categories");

    if (!product || product.isDeleted) {
      throw new Error("Product not found");
    }

    return product;
  }

  // Update product
   // In product.service.js
async updateProduct(id, updateData) {
  // Get current product first
  const currentProduct = await Product.findById(id);
  if (!currentProduct || currentProduct.isDeleted) {
    throw new Error("Product not found");
  }

  // Validate categories if being updated
  if (updateData.categories) {
    const categories = await Category.find({
      _id: { $in: updateData.categories },
      isDeleted: false
    });
    if (categories.length !== updateData.categories.length) {
      throw new Error("One or more categories not found or deleted");
    }
  }

  // Validate subcategories if being updated
  if (updateData.sub_categories) {
    const subCategories = await SubCategory.find({
      _id: { $in: updateData.sub_categories },
      isDeleted: false
    });
    if (subCategories.length !== updateData.sub_categories.length) {
      throw new Error("One or more subcategories not found or deleted");
    }
  }

  // Handle price validation
  if (updateData.sale_price !== undefined) {
    const regularPrice = updateData.price !== undefined 
      ? updateData.price 
      : currentProduct.price;
    
    if (updateData.sale_price !== null && updateData.sale_price >= regularPrice) {
      throw new Error(`Sale price ${updateData.sale_price} must be less than regular price ${regularPrice}`);
    }
  }

  // Update stock status if quantity changes
  if (updateData.stock_quantity !== undefined) {
    updateData.stock_status = updateData.stock_quantity > 0 
      ? 'in_stock' 
      : 'out_of_stock';
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate(["categories", "sub_categories"]);

  return product;
}

  // Soft delete product
  async softDeleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.isDeleted) {
      throw new Error("Product is already deleted");
    }

    product.isDeleted = true;
    await product.save();
    return product;
  }

  // Hard delete product
  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  // Get products by category
  async getProductsByCategory(categoryId, { page = 1, limit = 10 }) {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: ["categories", "sub_categories"],
    };

    return await Product.paginate(
      { categories: categoryId, isDeleted: false },
      options
    );
  }

  // Add to product.service.js
async searchProducts({
  q = '',
  category = [],
  minPrice,
  maxPrice,
  inStock,
  page = 1,
  limit = 10,
  sortBy = 'relevance',
  sortOrder = 'desc'
}) {
  const query = { isDeleted: false };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Category filter
  if (category && category.length > 0) {
    query.categories = { $in: category };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  // Stock status filter
  if (inStock !== undefined) {
    query.stock_status = inStock ? 'in_stock' : { $in: ['out_of_stock', 'on_backorder'] };
  }

  // Sorting options
  const sortOptions = {};
  if (sortBy === 'relevance' && q) {
    sortOptions.score = { $meta: 'textScore' };
  } else {
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
    populate: ['categories', 'sub_categories'],
    select: q ? { score: { $meta: 'textScore' } } : undefined
  };

  return await Product.paginate(query, options);
}

// auto search products
async autocomplete(query, limit = 5) {
  const results = await Product.aggregate([
    {
      $search: {
        index: 'product_search_index',
        autocomplete: {
          query: query,
          path: 'name',
          tokenOrder: 'sequential'
        }
      }
    },
    { $limit: limit },
    { $project: { _id: 1, name: 1 } }
  ]);
  return results;
}


  // Get featured products
  async getFeaturedProducts({ page = 1, limit = 10 }) {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: ["categories", "sub_categories"],
    };

    return await Product.paginate(
      { is_featured: true, isDeleted: false },
      options
    );
  }
}



module.exports = new ProductService();