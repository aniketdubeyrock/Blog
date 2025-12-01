# MERN Blog API - Project Documentation

## 1. Project Overview
This project is a robust RESTful blog API built with the MERN stack (MongoDB, Express, React, Node.js). It features user authentication, email verification, password reset, and CRUD operations for blog posts, comments, and categories.

**Key Features:**
- **Authentication:** JWT-based auth with cookies, email verification, and password reset.
- **Content Management:** Create, read, update, and delete posts.
- **Interaction:** Commenting system and post liking.
- **Categorization:** Organize posts by categories and tags.
- **User Profiles:** Manage user profiles and roles (User/Admin).

## 2. Database Setup & Data Insertion
The project uses **MongoDB** as the database. Data is not inserted directly via SQL scripts but through the API endpoints, ensuring all validation logic (defined in Mongoose models) is respected.

### How to Insert Data (Step-by-Step)

#### Step 0: Seed the Database (Recommended)
Since creating categories requires an **Admin** account, and you cannot register as an admin via the API, we have provided a seed script.
1.  Run `node seed.js` in your terminal.
2.  This will create an admin user:
    -   **Email:** `admin@example.com`
    -   **Password:** `adminpassword123`
3.  It will also create default categories like "Technology", "Lifestyle", etc.

#### Step 1: Create a User (Sign Up)
If you want a regular user account:
- **Endpoint:** `POST /api/v1/auth/register`
- **Body:**
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Result:** A new `User` document is created in the database. You will receive a token (cookie) or need to login.

#### Step 2: Login (Authentication)
- **Endpoint:** `POST /api/v1/auth/login`
- **Body:**
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Result:** You receive a JWT token (usually in a cookie) allowing you to access protected routes.

#### Step 3: Create a Category (Optional but Recommended)
Posts usually belong to a category.
- **Endpoint:** `POST /api/v1/categories` (Requires Admin role usually, check `routes/categories.js`)
- **Body:**
  ```json
  {
    "name": "Technology",
    "description": "Tech news and tutorials"
  }
  ```
- **Result:** A `Category` document is inserted.

#### Step 4: Create a Post
Now you can insert a blog post.
- **Endpoint:** `POST /api/v1/posts`
- **Body:**
  ```json
  {
    "title": "My First Blog Post",
    "content": "This is the content of the post...",
    "excerpt": "Short summary",
    "coverImage": "https://example.com/image.jpg",
    "category": "CATEGORY_ID_FROM_STEP_3",
    "tags": ["tech", "coding"]
  }
  ```
- **Result:** A `Post` document is inserted, linked to your User ID and the Category ID.

## 3. API Workflow
The typical workflow for a user interacting with the system is as follows:

1.  **Registration**: User signs up -> Database stores User.
2.  **Verification**: User verifies email (if enabled) -> `isVerified` becomes true.
3.  **Authentication**: User logs in -> Server issues JWT.
4.  **Content Creation**: Authenticated user creates Post -> Server validates and stores Post.
5.  **Interaction**: Other users can view, like, or comment on the Post.

## 4. Workflow UI (Mermaid Diagram)
Below is a visual representation of the application's workflow.

```mermaid
graph TD
    User((User))
    subgraph "Authentication Flow"
        Register[Register API]
        Login[Login API]
        DB_User[(MongoDB: Users)]
        Email[Email Service]
    end
    
    subgraph "Content Flow"
        CreatePost[Create Post API]
        ViewPost[Get Posts API]
        DB_Post[(MongoDB: Posts)]
        DB_Category[(MongoDB: Categories)]
    end

    User -->|1. Sign Up| Register
    Register -->|Save| DB_User
    Register -.->|Send Verification| Email
    
    User -->|2. Login| Login
    Login -->|Verify Creds| DB_User
    Login -->|Return Token| User
    
    User -->|3. Create Post (with Token)| CreatePost
    CreatePost -->|Validate & Save| DB_Post
    CreatePost -.->|Link Category| DB_Category
    
    User -->|4. Read Posts| ViewPost
    ViewPost -->|Fetch| DB_Post
```

## 5. Technical Details
- **Server Entry:** `server.js` initializes the Express app and connects to MongoDB.
- **Models:** defined in `models/` folder (User, Post, Comment, Category).
- **Routes:** defined in `routes/` folder, mapping URLs to controllers.
- **Controllers:** contain the business logic for each operation.

## 6. Troubleshooting Common Errors

### `TokenExpiredError: jwt expired`
- **Cause:** Your login session has ended.
- **Fix:** Send a `POST` request to `/api/v1/auth/login` again to get a new token.

### `ValidationError: Post validation failed`
- **Cause:** You are likely hitting the **Create Post** endpoint (`POST /api/v1/posts`) but missing required fields, or sending invalid data.
- **Fix:** Ensure your body includes:
  - `title`, `content`, `excerpt`, `coverImage`
  - `category`: Must be a valid MongoDB ObjectId (e.g., `656...`). Do not send a random string.
  - `slug`: This is auto-generated, you don't need to send it usually, but if the error persists, check if your title is empty.

### Cannot Create Category
- **Cause:** You are getting `403 Forbidden`.
- **Fix:** Only **Admins** can create categories. Use the `admin@example.com` account created by `node seed.js`.

This documentation provides a complete overview of how the system operates and how data flows into the database.
