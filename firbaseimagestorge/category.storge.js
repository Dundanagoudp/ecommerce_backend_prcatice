const multer = require('multer');
const admin = require("../config/firebase.config");
const { v4: uuidv4 } = require("uuid");

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Strict validation for adding
const validateAddCategoryData = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return res.status(400).json({ error: "Content-Type must be multipart/form-data" });
  }

  const { category_name, category_des, visibility } = req.body;

  if (!category_name || !category_des || visibility === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (category_name.length < 3 || category_name.length > 100) {
    return res.status(400).json({ error: "Category name must be between 3 and 100 characters" });
  }

  if (category_des.length < 5) {
    return res.status(400).json({ error: "Category description must be at least 5 characters" });
  }

  next();
};

// Relaxed validation for editing
const validateEditCategoryData = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return res.status(400).json({ error: "Content-Type must be multipart/form-data" });
  }

  const { category_name, category_des } = req.body;

  if (category_name && (category_name.length < 3 || category_name.length > 100)) {
    return res.status(400).json({ error: "Category name must be between 3 and 100 characters" });
  }

  if (category_des && category_des.length < 5) {
    return res.status(400).json({ error: "Category description must be at least 5 characters" });
  }

  next();
};

// Upload image to Firebase
const uploadToFirebase = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // No file to upload
    }

    const file = req.file;
    const fileName = `images/${uuidv4()}_${file.originalname}`;
    const bucketFile = admin.storage().bucket().file(fileName);
    const token = uuidv4();

    await bucketFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    req.firebaseData = {
      publicUrl: `https://firebasestorage.googleapis.com/v0/b/${admin.storage().bucket().name}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`,
    };

    next();
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
};

module.exports = {
  upload, // <-- export this to use .single("image")
  validateAddCategoryData,
  validateEditCategoryData,
  uploadToFirebase,
};
