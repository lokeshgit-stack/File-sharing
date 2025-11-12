# SharePod

A full-stack MERN application for sharing podcasts and files with secure authentication, cloud storage, and a modern React interface.

## 🚀 Features

- **Podcast Management**: Upload, stream, and manage podcasts with metadata
- **File Sharing**: Secure file upload and sharing with QR codes
- **User Authentication**: JWT-based authentication with registration and login
- **Cloud Storage**: AWS S3 integration for scalable file storage
- **Playlists**: Create and manage podcast playlists
- **Media Processing**: Automatic thumbnail generation and video processing
- **Responsive Design**: Modern UI built with Tailwind CSS and React
- **Real-time Logging**: Comprehensive logging system with MongoDB storage
- **QR Code Generation**: Easy sharing via QR codes
- **Private Routes**: Protected routes for authenticated users

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **AWS S3** - Cloud storage
- **JWT** - Authentication
- **Winston** - Logging
- **Multer** - File uploads
- **Sharp** - Image processing
- **FFmpeg** - Video processing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations
- **React Player** - Media player
- **QR Code Styling** - QR code generation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- AWS S3 bucket and credentials
- Vercel account (for frontend deployment)
- Render account (for backend deployment)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sharepod-mern-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/sharepod
   JWT_SECRET=your_jwt_secret_here
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   S3_BUCKET_NAME=your_s3_bucket_name
   ```

5. **Start MongoDB**
   Make sure MongoDB is running locally or update `MONGO_URI` for Atlas.

## 🚀 Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:3000

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Podcasts
- `GET /api/podcasts` - Get all podcasts
- `POST /api/podcasts` - Upload new podcast
- `GET /api/podcasts/:id` - Get podcast by ID
- `DELETE /api/podcasts/:id` - Delete podcast
- `POST /api/podcasts/:id/play` - Record play event
- `GET /api/podcasts/user/:userId` - Get user's podcasts

### Playlists
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create new playlist
- `GET /api/playlists/:id` - Get playlist by ID

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:fileId` - Get file info
- `GET /api/files` - Get all files

### Logs
- `GET /api/logs` - Get application logs

## 📁 Project Structure

```
sharepod-mern-app/
├── backend/
│   ├── config/          # Database, AWS, Logger configs
│   ├── middleware/      # Auth, upload, logging middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API route handlers
│   ├── utils/           # Helper utilities (QR, thumbnail)
│   ├── uploads/         # Local file storage
│   └── server.js        # Main server file
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Page components
│   │   └── services/    # API service functions
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (defaults to 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | AWS region | Yes |
| `S3_BUCKET_NAME` | S3 bucket name | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚀 Deployment

### Backend Deployment (Railway)

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_jwt_secret_here`
   - `AWS_ACCESS_KEY_ID=your_aws_access_key`
   - `AWS_SECRET_ACCESS_KEY=your_aws_secret_key`
   - `AWS_REGION=your_aws_region`
   - `S3_BUCKET_NAME=your_s3_bucket_name`
   - `FRONTEND_URL=https://your-vercel-frontend-url.vercel.app`
4. Deploy the backend

### Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository (select only the frontend folder)
3. Set environment variables in Vercel dashboard:
   - `REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api`
4. Deploy the frontend

### Environment Variables

#### Backend (.env.production)
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

#### Frontend (Vercel Environment Variables)
```
REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@sharepod.com or create an issue in the repository.

---

**SharePod** - Share your podcasts and files securely! 🎧📁
