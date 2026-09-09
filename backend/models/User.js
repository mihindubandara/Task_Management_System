const mongoose = require('mongoose');

// User database structure
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ['Admin', 'Project Manager', 'Developer'],
            default: 'Developer'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);