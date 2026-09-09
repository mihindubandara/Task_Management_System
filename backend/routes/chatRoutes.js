const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Send message
router.post('/send', authMiddleware, sendMessage);

// Get messages between logged-in user and specified user
router.get('/messages/:userId', authMiddleware, getMessages);

module.exports = router;
