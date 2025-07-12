# StackIt Backend API

A Node.js/Express backend server for the StackIt Q&A platform with MongoDB database.

## Features

- **Authentication**: JWT-based authentication with email/phone login
- **Questions & Answers**: Full CRUD operations with voting and following
- **User Management**: Profile management, reputation system, user blocking
- **Notifications**: Real-time notifications for various activities
- **File Upload**: Image upload support for questions and answers
- **Search & Filtering**: Advanced search with multiple filters
- **Rate Limiting**: API rate limiting for security
- **Validation**: Comprehensive input validation
- **Error Handling**: Centralized error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Questions
- `GET /api/questions` - Get all questions with filters
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/questions/:id/follow` - Follow/unfollow question

### Answers
- `POST /api/answers` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer
- `POST /api/answers/:id/unaccept` - Unaccept answer

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/questions` - Get user's questions
- `GET /api/users/:id/answers` - Get user's answers
- `POST /api/users/follow-tag` - Follow/unfollow tag
- `POST /api/users/block-user` - Block/unblock user

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/clear-all` - Clear all notifications

### File Upload
- `POST /api/upload/images` - Upload images
- `DELETE /api/upload/images/:filename` - Delete image

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=7d
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=http://localhost:3000
   MAX_FILE_SIZE=10485760
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Models

### User
- Basic info (name, email, phone, password)
- Avatar and preferences
- Reputation and verification status
- Followed tags and blocked users
- Question and answer counts

### Question
- Title, content, tags, language
- Author reference
- Votes, views, followers
- Answer count and accepted answer
- Creation and update timestamps

### Answer
- Content and images
- Author and question references
- Votes and acceptance status
- Creation and update timestamps

### Notification
- Type, title, message
- User and from user references
- Related content references
- Read status and timestamps

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **File Upload Security**: File type and size validation

## Error Handling

The API uses centralized error handling with:
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for development
- Logging for debugging

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### File Structure
```
server/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # Uploaded files
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 