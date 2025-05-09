const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { authMiddleware } = require("./middlewares/auth.middleware");

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cookieParser());

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);

// Middlewares
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


// Routes
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    message: "Backend service is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;