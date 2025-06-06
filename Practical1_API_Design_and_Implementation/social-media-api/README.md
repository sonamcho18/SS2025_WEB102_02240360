# Designing and Implementing RESTful API Endpoints

## Objectives

1. Design RESTful API endpoints following best practices for URI design  
2. Implement API endpoints with proper HTTP methods and status codes  
3. Configure content negotiation with different MIME types  
4. Set up proper request and response handling  
5. Document your API endpoints  

---

## Part 1: API Design

### Scenario

You are building a social media platform similar to Instagram with the following resources:

- Posts  
- Users  
- Comments  
- Likes  
- Followers  

### Tasks

1. *For each resource, design endpoints for the following operations:*

   - List all items  
   - Get a specific item  
   - Create a new item  
   - Update an existing item  
   - Delete an item  

*Example:*  
GET /posts - List all posts  

GET /posts/{id} - Get a specific post  

2. Complete the following table for your design:

*Users Resource:*

| URI/End point | HTTP Method    | Request Body    | Response Body    | Description    |
|---|---|---|---|---|
| /users    | GET    | Header: Authorization: Bearer (token)    | Status: 200 OK    | Get a list of users    |
||    | Query Parameters: page=1 limit=10    | Content: { "success": true, "count": 50, "page": 1, "total_pages": 5, "data": [{"id": 1, "username": "traveler", "full_name": "Karma", "profile_picture": "https://example.com/profiles/alex.jpg", "bio": "Travel_photographer", "created_at": "2023-01-15" }, ...]}    |    |
| /users    | POST    | Headers: Authorization: Bearer (token)    | Status: 201 Created    | Create a new user    |
||    | Content-Type: application/json    | Content: { "success": true, "data": { "id": 51, "username": "new_traveler", "email": "new@example.com", "password": "securepassword", "full_name": "New Traveler", "bio": "Adventure seeker" }    |    |

---

# Part 2: API Implementation

We'll be using Node.js and Express to create a fully functional API with proper HTTP methods, status codes, and content negotiation.

## Step 1: Project Setup

Let's begin by setting up our project environment:

1. Create a new directory for your project:
   bash
   mkdir social-media-api
   cd social-media-api
   

2. Initialize a new Node.js project:
   bash
   npm init -y
   

3. Install the necessary dependencies:
   bash
   npm install express morgan cors helmet
   

4. Install development dependencies:
   bash
   npm install nodemon --save-dev
   

5. Create the basic project structure:
   bash
   mkdir -p controllers routes middleware config utils
   touch server.js .env .gitignore
   

6. Set up your .env file:
   env
   PORT=3000
   

7. Create a basic .gitignore file:
   gitignore
   node_modules
   .env
   .DS_Store
   

8. Configure your package.json with start scripts:
   json
   "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
   }
   

---

## Step 2: Setting Up the Server

Let's create a basic Express server setup in our server.js file:

javascript
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(require('./middleware/formatResponse'));

// Routes (to be defined later)
app.use(express.static('public'));
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
// app.use('/comments', require('./routes/comments'));
// app.use('/likes', require('./routes/likes'));
// app.use('/followers', require('./routes/followers'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Social Media API' });
});

// Error handler middleware (to be defined later)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in development mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    process.exit();
});


---

## Step 3: Define Mock Data

Since we're not using a database yet, let's create some mock data to work with. Create a new file utils/mockData.js. Copy and paste the data from HERE to your mockData.js.

---

## Step 4: Create Error Handling Middleware

Let's create middleware for handling errors in middleware/errorHandler.js:

javascript
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.log(err);

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;


Create a utility for error responses in utils/errorResponse.js:

javascript
// utils/errorResponse.js
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;


Create an async handler utility in middleware/async.js:

javascript
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;


---

## Step 5: Create Controllers

Let's create controllers for each of our resources:

### User Controller (controllers/userController.js)

javascript
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { users } = require('../utils/mockData');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = users.length;

    // Get paginated results
    const results = users.slice(startIndex, endIndex);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: results.length,
        page,
        total_pages: Math.ceil(total / limit),
        pagination,
        data: results
    });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = users.find(user => user.id === req.params.id);
    if (!user) {
        return next(
            new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
        );
    }
    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Public
exports.createUser = asyncHandler(async (req, res, next) => {
    const newUser = {
        id: (users.length + 1).toString(),
        username: req.body.username,
        email: req.body.email,
        full_name: req.body.full_name,
        profile_picture: req.body.profile_picture || 'default-profile.jpg',
        bio: req.body.bio || '',
        created_at: new Date().toISOString().slice(0, 10)
    };

    // Check if username already exists
    const existingUser = users.find(user => user.username === newUser.username);
    if (existingUser) {
        return next(new ErrorResponse('Username already exists', 400));
    }

    users.push(newUser);
    res.status(201).json({
        success: true,
        data: newUser
    });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (we'll simulate this)
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = users.find(user => user.id === req.params.id);

    if (!user) {
        return next(
            new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
        );
    }

    // Update user
    const index = users.findIndex(user => user.id === req.params.id);

    users[index] = {
        ...user,
        ...req.body,
        id: user.id // Ensure ID doesn't change
    };

    res.status(200).json({
        success: true,
        data: users[index]
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (we'll simulate this)
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = users.find(user => user.id === req.params.id);

    if (!user) {
        return next(
            new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
        );
    }

    // Delete user
    const index = users.findIndex(user => user.id === req.params.id);
    users.splice(index, 1);

    res.status(200).json({
        success: true,
        data: {}
    });
});


### Post Controller (controllers/postController.js)

javascript
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { posts, users } = require('../utils/mockData');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = posts.length;

    // Get paginated results
    const results = posts.slice(startIndex, endIndex);

    // Enhance posts with user data
    const enhancedResults = results.map(post => {
        const user = users.find(user => user.id === post.user_id);
        return {
            ...post,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                profile_picture: user.profile_picture
            }
        };
    });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: enhancedResults.length,
        page,
        total_pages: Math.ceil(total / limit),
        pagination,
        data: enhancedResults
    });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
    const post = posts.find(post => post.id === req.params.id);

    if (!post) {
        return next(
            new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
        );
    }

    // Enhance post with user data
    const user = users.find(user => user.id === post.user_id);
    const enhancedPost = {
        ...post,
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            profile_picture: user.profile_picture
        }
    };

    res.status(200).json({
        success: true,
        data: enhancedPost
    });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (we'll simulate this)
exports.createPost = asyncHandler(async (req, res, next) => {
    // Simulate authentication
    const userId = req.header('X-User-Id');
    if (!userId) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    const user = users.find(user => user.id === userId);
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const newPost = {
        id: (posts.length + 1).toString(),
        caption: req.body.caption,
        image: req.body.image,
        user_id: userId,
        created_at: new Date().toISOString().slice(0, 10)
    };

    posts.push(newPost);

    res.status(201).json({
        success: true,
        data: newPost
    });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (we'll simulate this)
exports.updatePost = asyncHandler(async (req, res, next) => {
    // Simulate authentication
    const userId = req.header('X-User-Id');
    if (!userId) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    let post = posts.find(post => post.id === req.params.id);
    if (!post) {
        return next(
            new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
        );
    }

    // Check if user owns the post
    if (post.user_id !== userId) {
        return next(new ErrorResponse('Not authorized to update this post', 401));
    }

    // Update post
    const index = posts.findIndex(post => post.id === req.params.id);
    posts[index] = {
        ...post,
        ...req.body,
        id: post.id, // Ensure ID doesn't change
        user_id: post.user_id // Ensure user_id doesn't change
    };

    res.status(200).json({
        success: true,
        data: posts[index]
    });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (we'll simulate this)
exports.deletePost = asyncHandler(async (req, res, next) => {
    // Simulate authentication
    const userId = req.header('X-User-Id');
    if (!userId) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    const post = posts.find(post => post.id === req.params.id);

    if (!post) {
        return next(
            new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
        );
    }

    // Check if user owns the post
    if (post.user_id !== userId) {
        return next(new ErrorResponse('Not authorized to delete this post', 401));
    }

    // Delete post
    const index = posts.findIndex(post => post.id === req.params.id);
    posts.splice(index, 1);

    res.status(200).json({
        success: true,
        data: {}
    });
});


---

## Step 6: Create Routes

Now let's create routes for each of our resources:

### User Routes (routes/users.js)

javascript
const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;


### Post Routes (routes/posts.js)

javascript
const express = require('express');
const {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost
} = require('../controllers/postController');

const router = express.Router();

router.route('/').get(getPosts).post(createPost);
router.route('/:id').get(getPost).put(updatePost).delete(deletePost);

module.exports = router;


Create similar route files for the other resources (comments, likes, followers).

---

## Step 7: Implement Content Negotiation

To implement content negotiation, we'll create a middleware that checks for different MIME types and formats our responses accordingly:

### middleware/formatResponse.js

javascript
const formatResponse = (req, res, next) => {
    const originalJson = res.json; // Store the original res.json method

    res.json = function(obj) { // Override res.json method
        const acceptHeader = req.headers.accept; // Check Accept header

        if (acceptHeader && acceptHeader.includes('application/xml')) {
            // Convert to XML (simplified example)
            const convertToXml = (obj) => {
                let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<response>\n';

                for (const key in obj) {
                    if (Array.isArray(obj[key])) {
                        xml += ` <${key}>\n`;
                        obj[key].forEach(item => {
                            xml += ' <item>\n';
                            for (const itemKey in item) {
                                xml += ` <${itemKey}>${item[itemKey]}</${itemKey}>\n`;
                            }
                            xml += ' </item>\n';
                        });
                        xml += ` </${key}>\n`;
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        xml += ` <${key}>\n`;
                        for (const nestedKey in obj[key]) {
                            xml += ` <${nestedKey}>${obj[key][nestedKey]}</${nestedKey}>\n`;
                        }
                        xml += ` </${key}>\n`;
                    } else {
                        xml += ` <${key}>${obj[key]}</${key}>\n`;
                    }
                }
                xml += '</response>';
                return xml;
            };

            res.set('Content-Type', 'application/xml'); // Set content type to XML
            // Call the original send method with XML
            return res.send(convertToXml(obj));
        } else {
            res.set('Content-Type', 'application/json'); // Default to JSON
            return originalJson.call(this, obj); // Call the original json method
        }
    };

    next();
};

module.exports = formatResponse;


Then add this middleware to our server.js:

javascript
app.use(require('./middleware/formatResponse'));


---

## Step 8: Set up API Documentation

Let's create a simple HTML documentation page. Create a public folder and add a docs.html file:

bash
mkdir public
touch public/docs.html


Add this content to docs.html:

html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Media API Documentation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        h1, h2, h3 {
            color: #0066cc;
        }

        .endpoint {
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }

        .method {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
        }

        .get {
            background-color: #61affe;
        }

        .post {
            background-color: #49cc90;
        }

        .put {
            background-color: #fca130;
        }

        .delete {
            background-color: #f93e3e;
        }

        .url {
            margin-left: 10px;
            font-family: monospace;
            font-size: 1.1em;
        }

        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <h1>Social Media API Documentation</h1>
    <p>This is the documentation for the Social Media API, a RESTful API for a platform.</p>

    <h2>Users</h2>
    <div class="endpoint">
        <span class="method get">GET</span>
        <span class="url">/api/users</span>
        <p>Get a list of all users with pagination</p>

        <h3>Query Parameters</h3>
        <table>
            <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
            </tr>
            <tr>
                <td>page</td>
                <td>Number</td>
                <td>Page number (default: 1)</td>
            </tr>
            <tr>
                <td>limit</td>
                <td>Number</td>
                <td>Number of users per page (default: 10)</td>
            </tr>
        </table>

        <h3>Response</h3>
        <pre>
{
    "success": true,
    "count": 2,
    "page": 1,
    "total_pages": 2,
    "pagination": {
        "next": {
            "page": 2,
            "limit": 10
        }
    },
    "data": [
        {
            "id": "1",
            "username": "traveler",
            "full_name": "Karma",
            "profile_picture": "https://example.com/profiles/traveler.jpg",
            "bio": "Travel_photographer",
            "created_at": "2023-01-15"
        },
        ...
    ]
}
        </pre>
    </div>

    <div class="endpoint">
        <span class="method get">GET</span>
        <span class="url">/api/users/:id</span>
        <p>Get a specific user by ID</p>

        <h3>Parameters</h3>
        <table>
            <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
            </tr>
            <tr>
                <td>id</td>
                <td>String</td>
                <td>User ID</td>
            </tr>
        </table>

        <h3>Response</h3>
        <pre>
{
    "success": true,
    "data": {
        "id": "1",
        "username": "traveler",
        "full_name": "Karma",
        "profile_picture": "https://example.com/profiles/traveler.jpg",
        "bio": "Travel photographer",
        "created_at": "2023-01-15"
    }
}
        </pre>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span>
        <span class="url">/api/users</span>
        <p>Create a new user</p>

        <h3>Request Body</h3>
        <pre>
{
    "username": "new_traveler",
    "email": "new@example.com",
    "password": "securepassword",
    "full_name": "New Traveler",
    "bio": "Adventure seeker"
}
        </pre>

        <h3>Response</h3>
        <pre>
{
    "success": true,
    "data": {
        "id": "4",
        "username": "new_traveler",
        "full_name": "New Traveler",
        "email": "new@example.com",
        "profile_picture": "default-profile.jpg",
        "bio": "Adventure seeker",
        "created_at": "2023-03-20"
    }
}
        </pre>
    </div>

    <!-- Continue with PUT and DELETE endpoints for users -->
    <!-- Then add endpoints for posts, comments, likes, followers -->
</body>
</html>


---

## Step 9: Create Controllers for Other Resources

Create similar controllers for the remaining resources (comments, likes, followers) following the same pattern as the user and post controllers.

---

## Step 10: Start Server

1. Start your server:
   bash
   npm run dev
   
```