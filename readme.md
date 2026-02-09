# SSL Sentry - Complete Authentication System

A comprehensive SSL and website performance checker with user authentication, automated monitoring, and notifications.

## Features

### Public Features
- **Free Website Analysis**: One-time SSL and performance checks without registration
- **SSL Certificate Validation**: Check SSL validity, expiry dates, and certificate chain
- **Performance Metrics**: Measure load times, FCP, LCP, and speed optimization
- **Accessibility Analysis**: Evaluate semantic structure and ARIA usage
- **SEO Optimization**: Analyze meta tags and structured data

### Authenticated Features
- **User Dashboard**: Track multiple websites with automated monitoring
- **Automated Monitoring**: Hourly checks with status tracking (healthy/warning/critical)
- **Smart Notifications**: Severity-ordered alerts (critical → warning → info)
- **SSL Expiry Alerts**: Notifications at 30 days, 7 days, and on expiry
- **Performance Tracking**: Monitor performance degradation over time
- **User Preferences**: Dark/light theme saved per user
- **Mobile-First Design**: Responsive interface for all devices

## Tech Stack

### Backend
- Node.js + Express 4.18.2
- MongoDB with Mongoose 8.0.3
- JWT authentication (jsonwebtoken 9.0.2)
- Password hashing (bcryptjs 2.4.3)
- Automated monitoring (node-cron 3.0.3)
- SSL checking (ssl-checker)
- Performance analysis (lighthouse)

### Frontend
- React 18.2.0
- React Router DOM 6.20.0
- Framer Motion 10.16.16
- Axios 1.6.2
- Context API for state management

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- MongoDB installed and running locally OR MongoDB Atlas account

### 1. Clone and Install

```bash
# Navigate to project directory
cd 08-SSLChecker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

The `.env` file in the `backend` directory is already configured with:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ssl-checker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Change `JWT_SECRET` in production!

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**MongoDB Atlas:**
- Create a cluster at https://cloud.mongodb.com
- Get connection string and update `MONGODB_URI` in `.env`
- Whitelist your IP address in Network Access

### 4. Start the Application

**Backend** (Port 5000):
```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
Monitoring service initialized
```

**Frontend** (Port 3000):
```bash
cd frontend
npm start
```

The app will open at http://localhost:3000

## Usage Guide

### For Visitors (No Account)
1. Visit http://localhost:3000
2. Enter any website URL in the hero section
3. Click "Analyze Website" for instant results
4. View SSL status, performance metrics, accessibility, and SEO

### For Registered Users

#### 1. Create Account
- Click "Sign Up" in navigation
- Enter name, email, and password (min 6 characters)
- Automatically redirected to dashboard

#### 2. Add Websites to Track
- Click "+ Add Website" button
- Enter URL (e.g., `google.com` or `https://example.com`)
- Add optional nickname for easy identification
- Set check interval (1-168 hours, default: 24)
- Click "Add Website"

#### 3. Monitor Status
- **Healthy** (Green): All checks passing, SSL valid, good performance
- **Warning** (Amber): SSL expiring in 30 days, minor issues
- **Critical** (Red): SSL expired/invalid, website down, poor performance

#### 4. Manual Checks
- Click refresh icon on any website card
- Forces immediate check regardless of interval
- Updates status and creates notifications if issues found

#### 5. View Notifications
- Click bell icon in header (shows unread count)
- Severity order: Critical → Warning → Info
- Mark as read, delete individual, or clear all
- Filters: All / Unread only

## API Endpoints

### Public Endpoints
- `POST /api/analyzer/analyze` - Analyze website (no auth required)
- `POST /api/analyzer/check-ssl` - Check SSL only
- `POST /api/analyzer/check-performance` - Check performance only

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user (returns JWT)
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (name, theme, notifications)
- `PUT /api/auth/change-password` - Change password

### Tracked Websites (Authentication Required)
- `GET /api/websites` - Get all tracked websites for user
- `POST /api/websites` - Add new tracked website
- `PUT /api/websites/:id` - Update website (nickname, interval)
- `DELETE /api/websites/:id` - Delete tracked website
- `POST /api/websites/:id/check` - Manual check now

### Notifications (Authentication Required)
- `GET /api/notifications` - Get all notifications (severity-ordered)
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/clear-all` - Clear all notifications

## Automated Monitoring

The backend runs a cron job **every hour** that:
1. Checks all tracked websites for all users
2. Performs full SSL and performance analysis
3. Updates website status (healthy/warning/critical)
4. Generates notifications based on severity rules

### Notification Rules

**Critical Severity:**
- SSL certificate expired
- SSL certificate invalid
- Website is down (unreachable)
- SSL expiring within 7 days
- Performance score < 50

**Warning Severity:**
- SSL expiring within 30 days (but > 7 days)
- Performance degraded > 20 points from last check

**Info Severity:**
- General status updates
- Successful checks after previous failures

## Color Palette (Deep Slate Dark Mode)

### Backgrounds
- Primary: `#0a0e1a`
- Secondary: `#131827`
- Tertiary: `#1e293b`

### Text
- Primary: `#f1f5f9`
- Secondary: `#cbd5e1`
- Muted: `#64748b`

### Accents
- Green: `#10b981` (Healthy, Success)
- Teal: `#06b6d4` (Links, Primary actions)
- Amber: `#fb923c` (Warning)
- Red: `#f43f5e` (Critical, Error)
- Blue: `#3b82f6` (Info)

## Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running: `mongod` or `sudo systemctl status mongod`
- Verify MONGODB_URI in `.env`
- For Atlas: Check IP whitelist and credentials

### JWT Authentication Error
- Check JWT_SECRET is set in `.env`
- Token expires after 7 days - login again
- Clear browser localStorage if getting auth errors

### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check CORS configuration in `server.js`
- Verify API base URL in `frontend/src/services/api.js`

### Monitoring Service Not Running
- Check console for "Monitoring service initialized"
- Verify cron syntax if customized
- Check MongoDB connection (monitoring requires DB)

## Security Notes

### For Production
1. **Change JWT Secret**: Generate strong random secret
2. **Use MongoDB Authentication**: Enable auth and create admin user
3. **Enable HTTPS**: Use SSL/TLS certificates
4. **Rate Limiting**: Add rate limiting to API endpoints
5. **CORS Configuration**: Whitelist specific domains only

## License
MIT License - Built for developers, by developers.
# SSL-Sentry
# SSL-Sentry
