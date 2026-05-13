require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Import Models & Middleware
const Admin = require('./models/Admin');
const Gallery = require('./models/Gallery');
const { protect } = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- Cloudinary Setup ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dental_gallery', // Folder name in your Cloudinary account
        allowedFormats: ['jpeg', 'png', 'jpg'],
    },
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Initial Admin Setup Route (Run this ONCE to create the dentist's account, then delete/comment it out)
app.post('/api/setup', async (req, res) => {
    const { username, password } = req.body;
    const adminExists = await Admin.findOne({ username });
    
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });
    
    const admin = await Admin.create({ username, password });
    res.status(201).json({ message: 'Admin created successfully' });
});

// 2. Admin Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
        // Generate Token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ _id: admin._id, username: admin.username, token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// 3. Get All Gallery Images (Public Route for the Website)
app.get('/api/gallery', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 4. Upload New Before/After Images (Protected Route)
// Using upload.fields to handle multiple specific image uploads at once
app.post('/api/gallery', protect, upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // Grab the secure URLs returned by Cloudinary
        const beforeImageUrl = req.files['beforeImage'][0].path;
        const afterImageUrl = req.files['afterImage'][0].path;

        const newGalleryItem = await Gallery.create({
            title,
            description,
            beforeImageUrl,
            afterImageUrl
        });

        res.status(201).json(newGalleryItem);
    } catch (error) {
        // ADD THIS LINE TO REVEAL THE ERROR:
        console.error("🚨 UPLOAD ERROR DETAILS:", error); 
        
        res.status(500).json({ message: 'Failed to upload images' });
    }
});

// 5. Delete an Image Pair (Protected Route)
app.delete('/api/gallery/:id', protect, async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Gallery item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
// --- GLOBAL ERROR HANDLER ---
// This catches errors from Multer/Cloudinary before they crash the server
app.use((err, req, res, next) => {
    console.error("🚨 MULTER/CLOUDINARY ERROR:", err.message || err);
    
    // This forces JavaScript to open the "box" and print the actual contents
    console.error("Full Details:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    
    res.status(500).json({ message: err.message || 'Image upload failed' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));