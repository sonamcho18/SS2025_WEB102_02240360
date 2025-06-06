## NOTE: The actual practical work implementation is done in Practical2_API_Design_and_Implementation_Tiktok folder. This folder is just for README.md and Reflection.md.

#  Practical 4: Connecting TikTok to PostgreSQL with Prisma ORM

##  Objectives
- Set up a PostgreSQL database for TikTok clone application
- Configure Prisma ORM to interact with the database  
- Migrate from in-memory data models to persistent database storage
- Implement authentication with password encryption
- Update RESTful API endpoints to use the database

##  Part 1: Setting Up PostgreSQL Database

### Step 1: Create Database
Access PostgreSQL command line:
bash
sudo -u postgres psql


Create new database and user:
sql
CREATE DATABASE tiktok_db;
CREATE USER tiktok_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tiktok_db TO tiktok_user;


Exit PostgreSQL:
bash
\q


##  Part 2: Setting Up Prisma ORM

### Step 1: Install Dependencies
bash
cd server
npm install @prisma/client
npm install prisma --save-dev


### Step 2: Initialize Prisma
bash
npx prisma init


This creates:
-  prisma directory with schema.prisma file
-  .env file for environment variables

### Step 3: Configure Database Connection
Edit .env file:
env
DATABASE_URL="postgresql://tiktok_user:your_password@localhost:5432/tiktok_db?schema=public"


### Step 4: Install Additional Dependencies
bash
npm install bcrypt jsonwebtoken


##  Part 3: Creating Database Schema

### Step 1: Create Migration
bash
npx prisma migrate dev --name init


This command:
1.  Creates SQL migration files in prisma/migrations
2.  Applies migration to database
3.  Generates Prisma Client

### Step 2: Create Prisma Client Instance
Create src/lib/prisma.js:
javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;


### Step 3: Create Authentication Middleware
Create src/middleware/auth.js for JWT token verification.

##  Part 4: Update Controllers

Update controllers to use Prisma:
-  *User Controller*: Password hashing, JWT tokens, database queries
-  *Video Controller*: Complex queries with relationships, transactions
-  *Comment Controller*: Database operations for comments

Key concepts:
-  Password hashing using bcrypt
-  JWT token generation for authentication  
-  Database queries using Prisma Client
-  Transactions for multi-table operations

##  Part 5: Authentication Implementation

### Protected Routes Setup
- Create authentication middleware
- Update routes to use auth middleware
- Configure environment variables

### Environment Variables (.env)
env
# Server settings
PORT=5000
NODE_ENV=development

# Database settings  
DATABASE_URL="postgresql://tiktok_user:your_password@localhost:5432/tiktok_db?schema=public"

# JWT settings
JWT_SECRET=yourverylongandsecurerandomsecret
JWT_EXPIRE=30d


##  Part 6: Testing Database Integration

### Start Server
bash
npm run dev


### Test with Postman
1.  Register new user
2.  Login user  
3.  Test protected routes with JWT token
4.  Create video (protected route)

##  Part 7: Creating Test Data

### Create Seed File
Create prisma/seed.js to populate database with:
-  10 users
-  50 videos (5 per user)
-  200 comments
-  300 video likes
-  150 comment likes  
-  40 follow relationships

### Add Seed Script
Update package.json:
json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js", 
  "seed": "node prisma/seed.js"
}


### Run Seed Script
bash
npm run seed


##  Key Concepts

###  Database Schema Design
- *Tables*: Represent entities (users, videos, comments)
- *Relationships*: Connections between tables (one-to-many, many-to-many)
- *Indexes*: Improve query performance
- *Foreign Keys*: Maintain data integrity

###  Object-Relational Mapping (ORM)
- Maps database tables to programming objects
- Simplifies database operations with type safety
- Reduces boilerplate SQL code
- Handles database migrations

###  Authentication & Security
- *Password Hashing*: Never store plain-text passwords
- *JWT Tokens*: Secure, stateless authentication  
- *Protected Routes*: Middleware to secure endpoints

###  Prisma Features
- *Model Definitions*: Define data structure in schema.prisma
- *Migrations*: Version control for database schema
- *Relationships*: Define connections between models
- *Transactions*: Ensure data consistency

##  Resources
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Authentication Guide](https://jwt.io/)
- [Postman Testing Guide](https://docs.google.com/document/d/1OlnYRUqXZYWUl5AksoGOQYFqaT71KYJ6wiDU03y40Fk/edit?usp=sharing)

##  Getting Started
1. Clone the repository
2. Install dependencies: npm install
3. Set up PostgreSQL database
4. Configure environment variables
5. Run migrations: npx prisma migrate dev
6. Seed database: npm run seed
7. Start server: npm run dev

