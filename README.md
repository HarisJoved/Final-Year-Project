# Handwriting OCR Application

A full-stack web application for extracting and correcting text from handwriting images using OCR technology.

## Features

### Backend (FastAPI)
- **User Authentication**: JWT-based authentication with password hashing
- **User Management**: Profile management and secure registration/login
- **OCR Processing**: Extract text from handwriting images using Tesseract OCR
- **Document Management**: Save, retrieve, and update OCR results and corrections
- **MongoDB Integration**: Async MongoDB operations with Motor driver
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation

### Frontend (React + Tailwind CSS)
- **Modern UI**: Clean, professional interface with dark mode support
- **Responsive Design**: Mobile-first design that works on all devices
- **Document Upload**: Drag-and-drop image upload with preview
- **Text Correction**: Side-by-side view of original OCR and corrected text
- **Document Management**: List, view, edit, and delete documents
- **User Profile**: Update username and email with validation
- **Real-time Feedback**: Toast notifications and loading states

### Infrastructure
- **Docker**: Containerized application with multi-service setup
- **MongoDB**: Document database with proper indexing
- **Nginx**: Production-ready web server for frontend
- **Health Checks**: Container health monitoring

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd handwriting-ocr-app
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your preferred settings
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Database

MongoDB runs on port 27017 with the following default credentials:
- Username: `admin`
- Password: `password123`
- Database: `handwriting_ocr`

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Documents
- `POST /documents/upload-image` - Upload and process image
- `POST /documents/` - Save document with corrections
- `GET /documents/` - Get user documents
- `GET /documents/{id}` - Get specific document
- `PUT /documents/{id}` - Update document corrections
- `DELETE /documents/{id}` - Delete document

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  FastAPI Backend│    │    MongoDB      │
│   (Port 3000)   │◄──►│   (Port 8000)   │◄──►│   (Port 27017)  │
│   Nginx + Node  │    │   Python + OCR  │    │   Document DB   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, React Router, Axios
- **Backend**: FastAPI, Python 3.11, Motor (MongoDB), Tesseract OCR
- **Database**: MongoDB 7.0
- **Authentication**: JWT tokens, bcrypt password hashing
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (production)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB admin username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password | `password123` |
| `DATABASE_NAME` | Application database name | `handwriting_ocr` |
| `JWT_SECRET_KEY` | JWT signing secret | `change-in-production` |
| `JWT_EXPIRATION_HOURS` | JWT token expiration | `24` |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (NoSQL)
- Secure HTTP headers
- Non-root Docker containers

## Production Deployment

1. **Update environment variables**
   ```bash
   # Generate a secure JWT secret
   openssl rand -hex 32
   # Update .env with production values
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up reverse proxy** (recommended)
   - Configure Nginx or Apache as reverse proxy
   - Enable SSL/TLS certificates
   - Set up domain and DNS

## Monitoring

Health check endpoints:
- Backend: `GET /health`
- Frontend: `GET /` (via Nginx)
- MongoDB: Built-in health checks

## Troubleshooting

### Common Issues

1. **OCR not working**: Ensure Tesseract is installed in the backend container
2. **CORS errors**: Check frontend URL in backend CORS configuration
3. **Database connection**: Verify MongoDB connection string and credentials
4. **Port conflicts**: Ensure ports 3000, 8000, and 27017 are available

### Logs

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the troubleshooting section above
