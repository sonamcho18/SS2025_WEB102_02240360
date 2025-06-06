# Practical 5: Implementing Cloud Bucket Storage with Supabase

## Overview
In this practical, we will upgrade our TikTok web application by *migrating from local file storage to cloud storage using Supabase Storage*. This will enhance our application's scalability and reliability while providing better access control for user-uploaded content.

## What is Cloud Storage?

### The Limitations of Local Storage
So far, our application has been storing files (videos and thumbnails) in a local uploads directory on our server. While this approach works for development, it has several limitations:

1. *Disk Space*: The server has limited disk space, which can quickly fill up with video files  
2. *Scaling*: When deploying to multiple servers, files stored on one server aren't available to others  
3. *Reliability*: If the server crashes or is redeployed, locally stored files can be lost  
4. *CDN Benefits*: Local files don't benefit from Content Delivery Networks for faster global access  
5. *Backup*: There is typically no automatic backup system for local files  

### Benefits of Cloud Storage
Cloud storage solves these problems by:

1. *Scalability*: Virtually unlimited storage capacity that grows with your needs  
2. *Reliability*: Built-in redundancy and backup systems to prevent data loss  
3. *Performance*: Global CDN distribution for faster access worldwide  
4. *Security*: Advanced permissions and access control systems  
5. *Cost-effectiveness*: Pay only for what you use, without managing infrastructure

---

## How Cloud Storage Works in Web Applications
In a typical web application, the flow for handling files with cloud storage is:

1. *Frontend Upload*: The user selects a file through the browser  
2. *Direct Upload*: The file is uploaded directly from the browser to the cloud storage provider  
3. *Metadata Storage*: Your server stores metadata about the file (like the URL) in your database  
4. *Access Control*: The cloud storage provider handles permissions for who can access the file  
5. *Serving Content*: Files are served directly from the cloud provider's CDN  

## Introduction to Supabase Storage

### What is Supabase?
Supabase is an open-source Firebase alternative, providing:

- Database (PostgreSQL)
- Authentication
- Storage
- Real-time subscriptions
- Edge Functions

### How Supabase Storage Works
Supabase Storage organizes files in "buckets" with security rules:

- *Public*: Anyone can access the files  
- *Private*: Only authenticated users can access files  
- *Custom*: Access controlled by custom security policies  

---

## Setting Up Supabase Storage

### Step 1: Create a Supabase Account and Project
1. Go to [supabase.com](https://supabase.com) and sign up  
2. Click "New Project" and enter a name (e.g., "tiktok")  
3. Choose a strong database password  
4. Select a region closest to your target audience  
5. Click "Create new project"  

### Step 2: Create Storage Buckets
1. In the Supabase dashboard, navigate to "Storage"  
2. Click "Create Bucket"  
3. Name it "videos" and select "Public" access  
4. Repeat to create "thumbnails" bucket  

### Step 3: Set Up Storage Policies
For each bucket:

1. Click on the bucket  
2. Click "Policies"  
3. Add policy for authenticated users to upload files  
4. Add policy for public access to view files  

---

## Backend Implementation

### Step 1: Install Supabase SDK
bash
cd server
npm install @supabase/supabase-js


### Step 2: Create Supabase Client Configuration
Create src/lib/supabase.js:
javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;


### Step 3: Update Environment Variables
Add to .env:
env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_PUBLIC_KEY=your-public-key
SUPABASE_STORAGE_URL=https://your-project-id.supabase.co/storage/v1


### Step 4: Update Video Controller
Modify videoController.js to use Supabase for file operations.

### Step 5: Update Prisma Schema
Add storage path fields to Video model:
prisma
model Video {
  videoStoragePath String? @map("video_storage_path")
  thumbnailStoragePath String? @map("thumbnail_storage_path")
}


---

## Frontend Implementation

### Step 1: Install Supabase Client
bash
cd tiktok_frontend
npm install @supabase/supabase-js


### Step 2: Create Supabase Client Configuration
Create src/lib/supabase.js:
javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;


### Step 3: Update Environment Variables
Add to .env.local:
env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=your-public-key


### Step 4: Update Upload Components
Modify upload page and VideoCard components to handle Supabase URLs.

---

## Testing and Deployment

### Step 1: Run Migration Script (if needed)
bash
cd server
node scripts/migrateVideosToSupabase.js


### Step 2: Clean Up Local Storage
1. Verify all videos play correctly from Supabase  
2. Back up local uploads directory  
3. Remove local file serving code  

---

## Resources
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [File Upload Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications)