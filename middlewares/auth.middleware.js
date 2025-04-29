const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "Authentication required. No token provided." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded._id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid token. User not found." 
      });
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        success: false,
        error: "Token expired. Please login again." 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    let errorMessage = "Please authenticate";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired. Please login again.";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token. Please login again.";
    }

    res.status(401).json({ 
      success: false,
      error: errorMessage 
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: "Access denied. Admin privileges required." 
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};