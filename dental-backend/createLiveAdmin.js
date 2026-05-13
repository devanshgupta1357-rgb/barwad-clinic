const mongoose = require('mongoose');
const Admin = require('./models/Admin'); // This connects to the model we fixed earlier

// Your exact LIVE database link
const liveURI = "mongodb+srv://chandrakant240806_db_user:jFab2s8PEqBxOz4N@cluster0.v9cdhdb.mongodb.net/clinic?appName=Cluster0";

mongoose.connect(liveURI)
    .then(async () => {
        console.log("✅ Successfully connected to the LIVE Cloud Database!");
        
        // Check if drbarwad already exists to prevent duplicate errors
        const existingAdmin = await Admin.findOne({ username: 'drbarwad' });
        if (existingAdmin) {
            console.log("⚠️ The admin 'drbarwad' already exists in the live database!");
            process.exit();
        }

        // Create the new admin
        const newAdmin = new Admin({
            username: 'drbarwad',
            password: 'adminpassword123' // The doctor can change this later
        });

        await newAdmin.save();
        console.log("🎉 SUCCESS! Live Admin account created.");
        console.log("You can now log into your Vercel website!");
        process.exit();
    })
    .catch(err => {
        console.error("❌ Connection failed:", err);
        process.exit(1);
    });