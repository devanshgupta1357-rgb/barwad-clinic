require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected directly to MongoDB...');
        
        // Check if admin already exists to prevent duplicates
        const existingAdmin = await Admin.findOne({ username: 'drbarwad' });
        if (existingAdmin) {
            console.log('Admin account already exists!');
            process.exit(0);
        }

        // Create the new admin
        const newAdmin = new Admin({ 
            username: 'drbarwad', 
            password: 'adminpassword123' 
        });
        
        await newAdmin.save();
        console.log('SUCCESS: Admin created successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });