const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "Root Canal Recovery"
    description: { type: String },
    beforeImageUrl: { type: String, required: true },
    afterImageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);