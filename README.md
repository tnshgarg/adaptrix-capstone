# Adaptrix - LoRa Adapter Marketplace

A modern web platform for sharing and discovering LoRa (Low-Rank Adaptation) adapters for large language models. Built as a college capstone project.

## 📋 Project Overview

Adaptrix is a full-stack MERN application that allows users to upload, share, download, and review LoRa adapters. The platform features user authentication, file management, social interactions (reviews and stars), and comprehensive CRUD operations.

## ✨ Key Features

### User Management
- **Authentication**: Secure JWT-based authentication with Bcrypt password hashing
- **User Registration & Login**: Complete signup and signin flows
- **Protected Routes**: Dashboard and user-specific features require authentication

### Adapter Management (CRUD)
- **Create**: Upload new adapters with metadata (name, description, category, tags, file)
- **Read**: Browse adapters with pagination, filtering, and search
- **Update**: Modify adapter details (backend ready)
- **Delete**: Remove your adapters
- **File Upload**: Integration with Cloudinary for file storage
- **Download Tracking**: Automatic download count increments

### Review System (CRUD)
- **Create**: Add reviews with star ratings (1-5) and comments
- **Read**: View all reviews for each adapter
- **Update**: Edit your own reviews
- **Delete**: Remove your reviews
- **Ownership Control**: Users can only modify their own reviews

### Social Features
- **Star/Unstar**: Mark favorite adapters
- **Star Count**: Track popularity
- **Download Count**: Monitor adapter usage
- **Author Attribution**: See who created each adapter

### Search & Discovery
- **Pagination**: 10-12 items per page on all listing pages
- **Category Filtering**: Filter by Development, Healthcare, Business, etc.
- **Search**: Find adapters by name, description, or tags
- **Sorting**: Sort by popularity, stars, recent, or name

### Platform Stats
- **Real-time Aggregation**: Total adapters, downloads, and users
- **User Dashboard**: Personal stats for your adapters
- **Performance Metrics**: Downloads and stars per adapter

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library built on Radix UI
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Cloudinary**: File storage

### Key Libraries
- **lucide-react**: Icon library
- **date-fns**: Date formatting
- **class-variance-authority**: Component variants
- **clsx & tailwind-merge**: Conditional styling

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd adaptrix-capstone
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Configure environment variables**

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. **Seed the database (optional)**
```bash
cd backend
node seed.js
```

This creates test users, adapters, and reviews. Test credentials:
- Email: `john@example.com`
- Password: `password123`

### Running the Application

1. **Start the backend server**
```bash
cd backend
nodemon server.js
```
Server runs on `http://localhost:5001`

2. **Start the frontend (in a new terminal)**
```bash
npm run dev
```
App runs on `http://localhost:3000`

## 📁 Project Structure

```
adaptrix-capstone/
├── backend/
│   ├── models/           # Mongoose schemas (User, Adapter, Review, Star)
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication routes
│   │   ├── adapters.js   # Adapter CRUD
│   │   ├── reviews.js    # Review CRUD
│   │   ├── stars.js      # Star/unstar functionality
│   │   ├── downloads.js  # Download tracking
│   │   ├── platform.js   # Platform statistics
│   │   └── dashboard.js  # User dashboard stats
│   ├── middleware/       # Auth middleware
│   ├── config/           # Database configuration
│   ├── seed.js           # Database seeder
│   └── server.js         # Express app entry point
│
├── src/
│   ├── app/              # Next.js pages
│   │   ├── page.tsx      # Home/marketplace
│   │   ├── auth/         # Login/signup pages
│   │   └── dashboard/    # Protected dashboard pages
│   │       ├── page.tsx              # Dashboard home
│   │       ├── adapters/             # My adapters list
│   │       │   └── [id]/page.tsx     # Adapter details
│   │       └── create/               # Create adapter
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── dashboard-nav.tsx         # Navigation
│   │   ├── adapter-form.tsx          # Create/edit form
│   │   └── review-section.tsx        # Reviews component
│   ├── contexts/         # React contexts (AuthContext)
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client
│   │   └── utils.ts      # Helper functions
│   └── hooks/            # Custom hooks
```

## 🔑 Core Functionality

### Authentication Flow
1. User registers with name, email, password
2. Password is hashed with bcrypt
3. JWT token generated on login
4. Token stored in localStorage
5. Protected routes verify token via middleware

### Adapter Upload Flow
1. User fills out adapter form
2. File uploaded to Cloudinary
3. Metadata saved to MongoDB
4. Adapter appears in marketplace and user's dashboard

### Review System
1. Users view adapter details
2. Authenticated users can add/edit/delete reviews
3. Reviews include 1-5 star rating and comment
4. Only review owner can modify/delete

### Download Tracking
1. User clicks download on adapter details
2. API increments download count
3. File download initiated
4. Stats updated in real-time

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Adapters
- `GET /api/adapters` - List adapters (with pagination, filters)
- `GET /api/adapters/:id` - Get adapter details
- `POST /api/adapters` - Create adapter (auth required)
- `PUT /api/adapters/:id` - Update adapter (auth required)
- `DELETE /api/adapters/:id` - Delete adapter (auth required)
- `POST /api/adapters/upload` - Upload file to Cloudinary

### Reviews
- `GET /api/reviews/adapter/:adapterId` - Get reviews for adapter
- `POST /api/reviews` - Create review (auth required)
- `PUT /api/reviews/:id` - Update review (auth required)
- `DELETE /api/reviews/:id` - Delete review (auth required)

### Stars
- `POST /api/stars/:adapterId` - Star adapter (auth required)
- `DELETE /api/stars/:adapterId` - Unstar adapter (auth required)
- `GET /api/stars/check/:adapterId` - Check if starred (auth required)

### Platform
- `GET /api/platform/stats` - Get platform statistics
- `POST /api/downloads/:id/download` - Increment download count

## 🎨 Features Implemented

- ✅ JWT Authentication with Bcrypt
- ✅ Adapter CRUD operations
- ✅ Review CRUD operations
- ✅ Star/Unstar functionality
- ✅ File upload with Cloudinary
- ✅ Download tracking
- ✅ Pagination (home page and My Adapters)
- ✅ Search and filtering
- ✅ Real platform statistics
- ✅ User dashboard
- ✅ Responsive design
- ✅ Protected routes

## 📝 Database Models

### User
- name, email, password (hashed)
- avatar, bio
- timestamps

### Adapter
- name, slug, description
- category, tags, version
- author (ref: User)
- downloads, starCount
- fileUrl, fileName, cloudinaryId
- compatibleModels, repository, readme
- timestamps

### Review
- user (ref: User)
- adapter (ref: Adapter)
- rating (1-5), comment
- timestamps

### Star
- user (ref: User)
- adapter (ref: Adapter)
- timestamp

## 🚀 Deployment Considerations

1. **Environment Variables**: Ensure all env vars are set
2. **MongoDB**: Use MongoDB Atlas for production
3. **Cloudinary**: Configure upload presets
4. **JWT Secret**: Use strong, unique secret in production
5. **Build**: Run `npm run build` before deployment
6. **Port Configuration**: Backend on 5001, Frontend on 3000

## 👨‍💻 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

**Backend:**
- `nodemon server.js` - Start with auto-reload
- `node server.js` - Start production server
- `node seed.js` - Seed database with test data

## 📚 Learning Outcomes

This project demonstrates:
- Full-stack MERN development
- RESTful API design
- Authentication & authorization
- File upload handling
- Database relationships
- State management
- Responsive UI design
- Component architecture

---

**NST Capstone Project** | Built with Next.js, Express, MongoDB | 2025
