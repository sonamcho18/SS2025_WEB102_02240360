# Implementing File Upload on the Server Application

## Objective:
Implement a server-side file upload system using Node.js and Express that can properly receive, validate, store, and serve files uploaded from the React/Next.js frontend. You will learn how to handle multipart form data on the server, implement file type validation, size limitations, and proper error handling while creating a secure and efficient file storage system.

By connecting the frontend drag-and-drop interface with the backend implementation, you will gain a comprehensive understanding of the complete file upload flow from client to server in modern web applications.

## Implementation Flow
1. *Setup the Express server environment* - Install necessary dependencies and create the basic server structure to handle HTTP requests.
2. *Configure middleware for file handling* - Implement Multer middleware to process multipart form data and manage file storage on the server.
3. *Create upload endpoints* - Develop API routes that accept file uploads, validate content types and sizes, and store files securely.
4. *Implement validation and security* - Add checks for file types, size limits, and proper error handling to prevent security vulnerabilities.
5. *Connect the frontend to the backend* - Modify the frontend code to communicate with the Express server instead of the Next.js API routes.
6. *Test the complete system* - Verify that files can be uploaded from the frontend, properly processed by the backend, and accessed when needed.

Refer here for implementation: https://github.com/syangche/Backend_Practicals.git

## Step 1: Set Up Your Express Server

First, create a new Node.js project for your backend:
bash
mkdir file-upload-server
cd file-upload-server
npm init -y
npm install express cors multer morgan dotenv


These packages serve the following purposes:
- express: Web server framework
- cors: Middleware to enable Cross-Origin Resource Sharing
- multer: Middleware for handling multipart/form-data (file uploads)
- morgan: HTTP request logger
- dotenv: For environment variable management

## Step 2: Create the Basic Server Structure

1. Create a basic server structure in server.js:
javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // HTTP request logging

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('File Upload Server is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


## Part 2: Configuring Multer for File Uploads

1. Add Multer configuration to handle file uploads in server.js after the middleware setup:
javascript
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.originalname;
        cb(null, `${timestamp}-${originalName}`);
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    // Accept only specific mime types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'), false);
    }
};

// Create the multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB in bytes
    },
    fileFilter: fileFilter
});


## Part 3: Creating the Upload API Endpoint

1. Add an upload route to server.js after multer configuration:
javascript
// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        console.log('File received:', req.file.originalname);
        console.log('File type:', req.file.mimetype);

        // Success response with file details
        return res.status(200).json({
            message: 'File uploaded successfully',
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: error.message
        });
    }
});


## Part 4: Configuring CORS for Frontend Connection

1. Update the CORS configuration in server.js:
javascript
// Replace the simple cors() call with:
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type']
}));


2. Create a .env file in your backend project:
env
PORT=8000
FRONTEND_URL=http://localhost:3000


[Rest of the content continues similarly...]
```