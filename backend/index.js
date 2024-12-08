const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: 'dhcfaeuqa', 
  api_key: '574276486374954', 
  api_secret: 'OOioTRRr_Tv8Bb3HfK8PQLcsjF0' 
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/cloudy-drive', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}) 
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

// User Model
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  }
});

const User = mongoose.model('User', UserSchema);

// File Model
const FileSchema = new mongoose.Schema({
  name: String,
  size: Number,
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  uploadedAt: { type: Date, default: Date.now },
  username: { 
    type: String, 
    required: true 
  }
});

const File = mongoose.model('File', FileSchema);

// Multer storage configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username } = req.body;

  try {
    // Find or create user
    let user = await User.findOne({ username });
    
    if (!user) {
      user = new User({ username });
      await user.save();
    }

    res.status(200).json({ message: 'Login successful', username });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// File Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'cloudy-drive'
    });

    // Create file record in MongoDB
    const newFile = new File({
      name: req.file.originalname,
      size: req.file.size,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      username: req.body.username
    });

    await newFile.save();

    // Remove local file
    fs.unlinkSync(req.file.path);

    res.status(201).json(newFile);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// List User-Specific Files Route
app.get('/api/files/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const files = await File.find({ username });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
});

// Delete File Route
app.delete('/api/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.cloudinaryPublicId);

    // Delete from MongoDB
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});