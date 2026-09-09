const Message = require('../models/Message');
const User = require('../models/User');

// Send Chat Message
const sendMessage = async (req, res) => {
    try {
        const { recipient, text } = req.body;
        const senderId = req.user.id;

        if (!recipient || !text || !text.trim()) {
            return res.status(400).json({
                message: 'Recipient and text are required.'
            });
        }

        // Fetch sender and recipient to validate roles
        const sender = await User.findById(senderId);
        const recipientUser = await User.findById(recipient);

        if (!recipientUser) {
            return res.status(404).json({
                message: 'Recipient user not found.'
            });
        }

        // Validate allowed chat configurations:
        // Admin <-> Developer (Allowed)
        // Admin <-> Project Manager (Allowed)
        // Project Manager <-> Developer (Allowed)
        // Same roles (Admin<->Admin, PM<->PM, Dev<->Dev) are NOT allowed.
        const senderRole = sender.role;
        const recipientRole = recipientUser.role;

        let isAllowed = false;
        if (
            (senderRole === 'Admin' && (recipientRole === 'Project Manager' || recipientRole === 'Developer')) ||
            (senderRole === 'Project Manager' && (recipientRole === 'Admin' || recipientRole === 'Developer')) ||
            (senderRole === 'Developer' && (recipientRole === 'Admin' || recipientRole === 'Project Manager'))
        ) {
            isAllowed = true;
        }

        if (!isAllowed) {
            return res.status(403).json({
                message: `Communication not allowed between ${senderRole} and ${recipientRole}.`
            });
        }

        const message = new Message({
            sender: senderId,
            recipient,
            text: text.trim()
        });

        const savedMessage = await message.save();

        res.status(201).json(savedMessage);

    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// Get Chat Messages with another user
const getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
            ]
        })
        .sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    sendMessage,
    getMessages
};
