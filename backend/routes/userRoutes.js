const express = require('express');

const {
    getUsers,
    createUser,
    deleteUser
} = require('../controllers/userController');

const {
    authMiddleware,
    adminOnly
} = require('../middleware/authMiddleware');

const router = express.Router();


// Get all users
router.get(
    '/',
    authMiddleware,
    getUsers
);


// Create Developer / Project Manager
router.post(
    '/',
    authMiddleware,
    adminOnly,
    createUser
);


// Delete Developer / Project Manager
router.delete(
    '/:id',
    authMiddleware,
    adminOnly,
    deleteUser
);


module.exports = router;