# Blog API

A robust RESTful blog API built with Node.js, Express, and MongoDB. It features user authentication, email verification, password reset, and CRUD operations for blog posts, comments, and categories.

## Features

- **Authentication:** JWT-based auth with cookies, email verification, and password reset.
- **Content Management:** Create, read, update, and delete posts.
- **Interaction:** Commenting system and post liking.
- **Categorization:** Organize posts by categories and tags.
- **User Profiles:** Manage user profiles and roles (User/Admin).
- **Search:** Full-text search for posts.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Email:** Nodemailer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas connection string)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd mern-blog-api
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Environment Setup:
    Create a `.env` file in the root directory (or use `.env.local`) and add the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=30d
    JWT_COOKIE_EXPIRE=30
    EMAIL_SERVICE=gmail
    EMAIL_USERNAME=your_email@gmail.com
    EMAIL_PASSWORD=your_email_app_password
    EMAIL_FROM=noreply@blogapp.com
    CLIENT_URL=http://localhost:3000
    ```

### Running the Server

- **Development Mode:**
    ```bash
    npm run dev
    ```
- **Production Mode:**
    ```bash
    npm start
    ```

The server will start on `http://localhost:5000` (or your specified PORT).

## Database Seeding

To set up the initial database with an Admin user and default categories:

```bash
node seed.js
```

This will create:
- **Admin User:** `admin@example.com` / `adminpassword123`
- **Default Categories:** Technology, Lifestyle, etc.

## API Documentation

A comprehensive API documentation page is available at the root URL when the server is running:
[http://localhost:5000/](http://localhost:5000/)

Alternatively, you can import the `postman_collection.json` file into Postman to test the endpoints.

## Project Structure

```
├── controllers/    # Request handlers
├── middleware/     # Custom middleware (auth, error handling)
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
├── server.js       # Entry point
└── seed.js         # Database seeder
```
