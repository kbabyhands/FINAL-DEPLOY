# Restaurant Menu Management System

A modern, interactive digital menu system for restaurants featuring 3D food models, dietary filtering, and comprehensive restaurant management tools.

## 🍽️ Features

### Customer Experience
- **Interactive Digital Menu** - Browse menu items with rich descriptions and imagery
- **3D Food Models** - View food items in 3D using Gaussian Splatting, PlayCanvas, and Three.js
- **Advanced Filtering** - Filter by categories, dietary restrictions (vegan, vegetarian, gluten-free, nut-free)
- **Responsive Design** - Optimized for mobile, tablet, and desktop devices
- **Dark/Light Mode** - User preference-based theming
- **QR Code Access** - Contactless menu access for restaurants

### Restaurant Management
- **Admin Dashboard** - Complete restaurant and menu management interface
- **Menu Item Management** - Create, edit, and organize menu items with CRUD operations
- **3D Model Upload** - Support for uploading and managing 3D food models
- **Restaurant Branding** - Customizable colors, logos, and themes
- **Analytics & Tracking** - View counts, customer reviews, and performance metrics
- **Review System** - Customer feedback and rating management

### Technical Features
- **Performance Optimization** - Device capability detection and adaptive loading
- **Analytics Integration** - Track menu item views and customer engagement
- **SEO Optimized** - Proper meta tags and structured data
- **PWA Ready** - Progressive Web App capabilities
- **Type-Safe Development** - Full TypeScript implementation

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast development and building
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality React components
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Three.js & React Three Fiber** - 3D graphics and visualization

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation and settings management
- **UUID** - Unique identifier generation

### Database
- **MongoDB** - Primary data storage
- **Supabase** - Additional cloud database features

### 3D Visualization
- **PlayCanvas** - 3D game engine integration
- **Gaussian Splatting** - Advanced 3D rendering technique
- **Three.js** - 3D graphics library

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Python 3.8+
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd restaurant-menu-system
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   yarn install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   
   Frontend (`.env` in frontend directory):
   ```bash
   VITE_REACT_APP_BACKEND_URL=http://localhost:8001
   ```
   
   Backend (`.env` in backend directory):
   ```bash
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=restaurant_menu_db
   ```

5. **Start Development Servers**
   
   Frontend:
   ```bash
   cd frontend
   yarn dev
   ```
   
   Backend:
   ```bash
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - Admin Dashboard: http://localhost:3000/admin

## 📁 Project Structure

```
restaurant-menu-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── services/       # API service layer
│   │   └── data/           # Mock data and constants
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # FastAPI backend application
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── tests/                  # Test files
└── README.md              # This file
```

## 🔧 Development

### Frontend Development
- Built with Vite for fast hot module replacement
- Uses TypeScript for type safety
- Tailwind CSS for styling with shadcn/ui components
- React Query for efficient server state management

### Backend Development
- FastAPI with automatic OpenAPI documentation
- Async MongoDB operations with Motor
- UUID-based document IDs for JSON compatibility
- CORS enabled for frontend development

### Key Development Features
- Hot reload for both frontend and backend
- Type-safe API contracts
- Comprehensive error handling
- Performance monitoring and optimization

## 📚 API Documentation

When running the backend server, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Key API Endpoints
- `GET /api/` - Health check
- `POST /api/status` - Create status check
- `GET /api/status` - Get status checks

## 🎨 Customization

### Restaurant Branding
- Upload custom logos and banners
- Set brand colors (primary, secondary, background)
- Choose custom fonts
- Configure restaurant information

### Menu Management
- Add/edit menu items with rich descriptions
- Upload food images and 3D models
- Set dietary restriction flags
- Organize items by categories
- Control item visibility and ordering

### 3D Model Support
- Gaussian Splat (.splat) files
- PlayCanvas scenes
- PLY mesh files
- Three.js compatible formats

## 🚀 Deployment

### Environment Variables
Ensure all environment variables are properly configured for production:

Frontend:
```bash
VITE_REACT_APP_BACKEND_URL=https://your-api-domain.com
```

Backend:
```bash
MONGO_URL=mongodb://your-mongo-connection-string
DB_NAME=your_production_db
```

### Build Commands
Frontend:
```bash
cd frontend
yarn build
```

Backend:
```bash
cd backend
pip install -r requirements.txt
```

## 🤝 Contributing

This is proprietary software. Contributions are limited to authorized team members only.

### Internal Development Workflow
1. Create feature branch from develop
2. Implement changes following coding standards
3. Add/update tests as necessary
4. Update documentation if needed
5. Submit pull request for team review
6. Code review by senior developers
7. Merge after approval

## 📝 License

This project is proprietary software. All rights reserved. Unauthorized copying, distribution, or modification is prohibited.

## 🆘 Support

For support and questions:
- Contact the development team
- Check the internal documentation
- Review the API documentation at `/docs`

## 🏗️ Architecture Overview

### Frontend Architecture
- Component-based React architecture
- Custom hooks for business logic
- Service layer for API communication
- Type-safe development with TypeScript

### Backend Architecture
- RESTful API design with FastAPI
- Async/await pattern for database operations
- Pydantic models for data validation
- MongoDB for flexible document storage

### 3D Rendering Pipeline
- Multiple 3D engine support
- Performance optimization based on device capabilities
- Preloading strategies for smooth user experience
- Fallback handling for unsupported devices
