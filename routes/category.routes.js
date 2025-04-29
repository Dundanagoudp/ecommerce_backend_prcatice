const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { upload, validateAddCategoryData, validateEditCategoryData, uploadToFirebase } = require("../middlewares/category.middleware");

router.post("/add",
  upload.single('image'),
  validateAddCategoryData,
  uploadToFirebase,
  categoryController.addCategory
);

router.put("/edit/:id",
  upload.single('image'),
  validateEditCategoryData,
  uploadToFirebase,
  categoryController.editCategory
);

router.get("/allcategories", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

router.delete("/delete/:id", categoryController.deleteCategory);
router.delete("/markAsDeleted/:id", categoryController.markAsDeleted);

module.exports = router;
