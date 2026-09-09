const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Developer'
        });

        res.status(201).json({
            message: "User registered successfully!",
            userId: newUser._id
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            error: error.message,
            details: error.toString()
        });
    }
};


// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                error: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET || 'supersecretkey123',
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            error: error.message,
            details: error.toString()
        });
    }
};


// Get all users
const getUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json(users);

    } catch (error) {

        console.error("GET USERS ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// Create Developer / Project Manager
const createUser = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // Check required fields
        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                error: "Name, email, password and role are required"
            });
        }


        // Only these roles can be created
        if (
            role !== 'Developer' &&
            role !== 'Project Manager'
        ) {
            return res.status(400).json({
                error: "Only Developer or Project Manager can be created"
            });
        }


        // Check existing user
        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists with this email"
            });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });


        res.status(201).json({
            message: "User created successfully!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {

        console.error("CREATE USER ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// Delete Developer / Project Manager
const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;


        // Find user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }


        // Admin cannot be deleted
        if (user.role === 'Admin') {
            return res.status(403).json({
                error: "Admin user cannot be deleted"
            });
        }


        // Delete user
        await User.findByIdAndDelete(id);


        res.status(200).json({
            message: "User deleted successfully!"
        });

    } catch (error) {

        console.error("DELETE USER ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUsers,
    createUser,
    deleteUser
};