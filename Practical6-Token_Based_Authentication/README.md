# Practical 6: Authentication - Token-based ( Email & Password ) 🔐

A comprehensive guide to implementing secure email/password authentication using TypeScript, Hono, PostgreSQL, and Prisma with JWT tokens.

##  Overview

This project demonstrates how to build a secure REST API with:
- *Password Authentication*: Email-based registration and login system
- *JWT Authorization*: Token-based access control for protected endpoints
- *Password Security*: Bcrypt hashing for secure password storage
- *Database Integration*: Prisma ORM with PostgreSQL

### Key Features
-  User registration with email validation
-  Secure password hashing using bcrypt
-  JWT token generation and verification
-  Protected endpoints with middleware
-  Error handling for authentication failures
-  Account balance management system

##  Prerequisites

### Required Knowledge
- Basic understanding of TypeScript/JavaScript
- Familiarity with Node.js and REST APIs
- Basic knowledge of relational databases
- Understanding of Prisma ORM concepts

### Development Environment
- *Bun* v1.x or later
- *PostgreSQL* database
- *Visual Studio Code* (recommended with Prisma extension)

##  Getting Started

### 1. Clone the Repository

bash
git clone https://github.com/rubcstswe/web102-hono-auth-jwt-prisma-forked.git
cd web102-hono-auth-jwt-prisma-forked
bun install


### 2. Database Setup

Update your database schema and generate Prisma client:

bash
bunx prisma db push
bunx prisma generate


### 3. Start the Development Server

bash
bun run dev


The server will start on http://localhost:3000

##  Database Schema

### User Model
prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  hashPassword String
  Account      Account[]
}


### Account Model
prisma
model Account {
  id      String @id @default(uuid())
  userId  String
  user    User   @relation(fields: [userId], references: [id])
  balance Int    @default(0)
}


*Relationship*: One User can have multiple Accounts (1:N relationship)

##  API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /register | Create new user account | ❌ |
| POST | /login | Authenticate user and get JWT | ❌ |

### Protected Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /protected/account/balance | Get user's account balance | ✅ |

##  Authentication Flow

### Registration Process
1. *User Registration* 
   - User provides email and password
   - Server validates email uniqueness
   - Password is hashed using bcrypt
   - User and default account created in database

2. *Response* 
   - Success message with user email
   - Error handling for duplicate emails

### Login Process
1. *User Login* 
   - User provides email and password
   - Server verifies email exists in database
   - Password verified against stored hash

2. *Token Generation* 
   - JWT token created with user ID as payload
   - Token expires in 60 minutes
   - Token returned to user

3. *Authorization* 
   - User includes JWT in Authorization header
   - Middleware verifies token on protected routes
   - Access granted to authenticated endpoints

##  Implementation Guide

### 1. User Registration

typescript
app.post("/register", async (c) => {
  try {
    const body = await c.req.json();

    // Hash password using bcrypt
    const bcryptHash = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: 4,
    });

    // Create user with account
    const user = await prisma.user.create({
      data: {
        email: body.email,
        hashedPassword: bcryptHash,
        Account: {
          create: {
            balance: 0,
          },
        },
      },
    });

    return c.json({ message: `\${user.email} created successfully` });
  } catch (e) {
    // Handle unique constraint violations
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return c.json({ message: 'Email already exists' });
      }
    }
    throw e;
  }
});


### 2. User Login with JWT

typescript
app.post("/login", async (c) => {
  try {
    const body = await c.req.json();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, hashedPassword: true },
    });

    if (!user) {
      return c.json({ message: "User not found" });
    }

    // Verify password
    const match = await Bun.password.verify(
      body.password,
      user.hashedPassword,
      "bcrypt"
    );

    if (match) {
      // Create JWT token
      const payload = {
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      };
      const secret = "mySecretKey";
      const token = await sign(payload, secret);
      
      return c.json({ 
        message: "Login successful", 
        token: token 
      });
    } else {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }
  } catch (error) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }
});


### 3. JWT Middleware Protection

typescript
// Apply JWT middleware to all /protected/* routes
app.use(
  "/protected/*",
  jwt({
    secret: 'mySecretKey',
  })
);

// Protected endpoint
app.get("/protected/account/balance", async (c) => {
  const payload = c.get('jwtPayload');
  
  if (!payload) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { Account: { select: { balance: true, id: true } } },
  });

  return c.json({ data: user });
});


##  Security Considerations

### Password Security
- *Bcrypt Hashing*: Passwords are never stored in plain text
- *Salt Rounds*: Cost factor of 4 for development (increase for production)
- *Hash Verification*: Uses secure comparison methods

### JWT Security
- *Secret Key*: Should be stored in environment variables
- *Token Expiration*: Tokens expire after 1 hour
- *Payload Security*: Only contains user ID, no sensitive data

### Error Handling
- *Generic Error Messages*: Prevents information leakage
- *Unique Constraint Handling*: Proper handling of duplicate emails
- *Authentication Failures*: Consistent error responses

##  Testing

### Registration Test
bash
curl -X POST http://localhost:3000/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'


### Login Test
bash
curl -X POST http://localhost:3000/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'


### Protected Endpoint Test
bash
curl -X GET http://localhost:3000/protected/account/balance \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"


##  Key Concepts Demonstrated

- *Authentication vs Authorization*: Clear distinction and implementation
- *Password Hashing*: Secure storage using bcrypt
- *JWT Tokens*: Stateless authentication mechanism
- *Middleware*: Route protection and request validation
- *Error Handling*: Graceful failure management
- *Database Relations*: User-Account relationship modeling

##  Production Considerations

1. *Environment Variables*: Store secrets securely
2. *HTTPS*: Always use encrypted connections
3. *Rate Limiting*: Prevent brute force attacks
4. *Input Validation*: Validate all user inputs
5. *Logging*: Implement proper security logging
6. *Token Refresh*: Consider refresh token implementation

---
