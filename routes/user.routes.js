const express = require('express');
const router = express.Router();
const { 
  authMiddleware, 
  adminMiddleware 
} = require('../middlewares/auth.middleware');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  registerAdmin
} = require('../controllers/user.controller');
const {
  registerValidator,
  loginValidator,
  userIdValidator
} = require('../validators/user.validator');

// Public routes
router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.get('/:id', authMiddleware, userIdValidator, getUserById);

// Admin registration
router.post('/register-admin', 
  authMiddleware, 
  adminMiddleware, 
  registerValidator, 
  registerAdmin
);

module.exports = router;