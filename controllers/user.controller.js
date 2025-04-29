const User = require("../models/user.model");
const { validationResult } = require('express-validator');

const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({ fullname, email, password });
        await user.save();
        
        const token = user.generateAuthToken();
        res.status(201).json({ 
            message: "User registered successfully", 
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                cart: user.cart
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = user.generateAuthToken();
        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const registerAdmin = async (req, res) => {
    const { fullname, email, password } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({ fullname, email, password, role: 'admin' });
        await user.save();
        
        const token = user.generateAuthToken();
        res.status(201).json({ 
            message: "Admin registered successfully", 
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            user: {
                id: req.user._id,
                fullname: req.user.fullname,
                email: req.user.email,
                role: req.user.role,
                cart: req.user.cart
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getAllUsers = async (req, res) => {
    try {
        // Only admin can access all users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const users = await User.find({}, { password: 0 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Users can only access their own data, admin can access any
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findById(userId, { password: 0 });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    getAllUsers,
    getUserById,
    registerAdmin
}