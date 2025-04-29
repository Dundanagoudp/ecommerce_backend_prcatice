const multer = require('multer');
const admin = require("../config/firebase.config");
const { v4: uuidv4 } = require("uuid");

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload image to Firebase (updated version)
const uploadToFirebase = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileName = `products/${uuidv4()}_${file.originalname}`;
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

    return {
      publicUrl: `https://firebasestorage.googleapis.com/v0/b/${admin.storage().bucket().name}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`,
      fileName
    };
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToFirebase
};