const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB Connected!');

        
        const email = 'admin@gmail.com';

        
        const newPassword = 'Admin@12345';

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        console.log('=================================');
        console.log('Password reset successfully!');
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('New Password:', newPassword);
        console.log('=================================');

        process.exit(0);

    } catch (error) {
        console.error('Password reset error:', error);
        process.exit(1);
    }
};

resetPassword();