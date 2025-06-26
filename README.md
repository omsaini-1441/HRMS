# HRMS Application

A full-stack Human Resource Management System built with React (Vite) frontend and Node.js backend.

## 🔗 Repository Links

- **Frontend**: [HRMS Frontend](https://github.com/omsaini-1441/HRMS)
- **Backend**: [HRMS Backend](https://github.com/omsaini-1441/HRMS-backend)

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## 🚀 Quick Start

### 1. Clone the Repositories

```bash
# Clone frontend repository
git clone https://github.com/omsaini-1441/HRMS.git
cd HRMS

# Clone backend repository (in a separate terminal/directory)
git clone https://github.com/omsaini-1441/HRMS-backend.git
cd HRMS-backend
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd HRMS-backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=jwt_secret_123
VITE_API_URL=http://localhost:5173/api
```

**Environment Variables Explanation:**
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
  - For local MongoDB: `mongodb://localhost:27017/hrms`
  - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/hrms`
- `JWT_SECRET`: Secret key for JWT token generation (change in production)
- `VITE_API_URL`: API URL for frontend communication

#### Start Backend Server
```bash
npm start
# or for development with auto-restart
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd HRMS
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

**Environment Variables Explanation:**
- `VITE_API_URL`: Backend API base URL

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend application will start on `http://localhost:5173`


### Option 1: Manual Start (Recommended for Development)

1. **Terminal 1 - Backend:**
   ```bash
   cd HRMS-backend
   npm install
   # Create .env file with backend environment variables
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd HRMS
   npm install
   # Create .env file with frontend environment variables
   npm run dev
   ```

### Option 2: Using Package Scripts

If you have a root package.json with scripts to run both applications:

```bash
# Install dependencies for both applications
npm run install:all

# Start both applications concurrently
npm run dev:all
```

## 🔧 Build for Production

### Backend Production Build
```bash
cd HRMS-backend
npm run build
npm start
```

### Frontend Production Build
```bash
cd HRMS
npm run build
npm run preview
```

## 📝 Additional Notes

### Database Setup
- Ensure MongoDB is running if using local installation
- For MongoDB Atlas, whitelist your IP address and use the correct connection string
- The application will create the necessary collections automatically

### API Endpoints
The backend API will be available at `http://localhost:5000/api` with endpoints for:
- User authentication
- Employee management
- HR operations
- Dashboard data

### Development Tips
- Backend runs on port 5000
- Frontend runs on port 5173
- Make sure both ports are available
- Check browser console and terminal for any errors
- Ensure environment variables are correctly set

## 🛠️ Troubleshooting

### Common Issues:
1. **Port already in use**: Change the PORT in backend .env file
2. **MongoDB connection failed**: Verify MONGODB_URI in .env file
3. **CORS errors**: Ensure VITE_API_URL matches backend URL
4. **JWT errors**: Verify JWT_SECRET is set in backend .env

### Environment File Locations:
- Backend: `HRMS-backend/.env`
- Frontend: `HRMS/.env`

## 📞 Support

If you encounter any issues, please check the repository issues or create a new issue in the respective repository.