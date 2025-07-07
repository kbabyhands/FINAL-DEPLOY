# Restaurant Menu Frontend

The frontend application for the Restaurant Menu Management System, built with React, TypeScript, and modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- yarn (recommended) or npm

### Installation & Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast development server and build tool
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality, accessible React components
- **React Query** - Powerful data synchronization for React
- **React Router** - Declarative routing for React
- **React Three Fiber** - React renderer for Three.js
- **PlayCanvas** - 3D graphics engine integration

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── admin/          # Admin dashboard components
│   └── common/         # Shared components
├── pages/              # Route components
│   ├── Index.tsx       # Main menu page
│   ├── Admin.tsx       # Admin dashboard
│   └── MenuItemViewer.tsx # 3D item viewer
├── hooks/              # Custom React hooks
│   ├── useMenuData.ts  # Menu data management
│   ├── useMenuFilters.ts # Filter functionality
│   └── useApiQuery.ts  # API data fetching
├── services/           # API service layer
│   └── api.ts          # API client and methods
├── utils/              # Utility functions
│   ├── device.ts       # Device capability detection
│   ├── formatters.ts   # Data formatting
│   └── shareMenu.ts    # Share functionality
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── data/               # Static data and constants
│   └── placeholderMenuItems.ts # Sample menu data
├── constants/          # Application constants
│   └── index.ts        # Configuration constants
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client and types
└── lib/                # Library utilities
    └── utils.ts        # General utility functions
```

## 🎨 Key Features

### User Interface
- **Responsive Design** - Mobile-first approach with perfect desktop experience
- **Dark/Light Mode** - System preference detection with manual toggle
- **Performance Optimized** - Lazy loading and device-based optimization
- **Accessibility** - WCAG compliant with keyboard navigation

### Menu Display
- **Interactive Grid** - Responsive card-based layout
- **Advanced Filtering** - Category and dietary restriction filters
- **Search Functionality** - Real-time menu item search
- **Featured Items** - Highlighted popular menu items

### 3D Visualization
- **Multiple Engines** - Support for PlayCanvas, Three.js, and Gaussian Splatting
- **Device Detection** - Automatic quality adjustment based on device capabilities
- **Preloading** - Smart 3D model preloading for smooth experience
- **Fallback Handling** - Graceful degradation for unsupported devices

### Admin Dashboard
- **Restaurant Management** - Complete restaurant profile and branding
- **Menu CRUD** - Full menu item management with drag-and-drop reordering
- **File Upload** - Image and 3D model upload with validation
- **Analytics** - View tracking and customer engagement metrics

## 🔧 Development

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Backend API URL
VITE_REACT_APP_BACKEND_URL=http://localhost:8001

# WebSocket port for development
WDS_SOCKET_PORT=443
```

### Available Scripts

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn preview          # Preview production build
yarn lint             # Run ESLint

# Type checking
yarn type-check       # Run TypeScript compiler check
```

### Code Style & Standards

- **TypeScript** - Strict mode enabled with comprehensive type checking
- **ESLint** - Code linting with React and TypeScript rules
- **Prettier** - Code formatting (if configured)
- **Component Patterns** - Functional components with hooks

### Performance Considerations

- **Bundle Splitting** - Automatic code splitting with Vite
- **Image Optimization** - Lazy loading and responsive images
- **3D Model Management** - Progressive loading and caching
- **Device Adaptation** - Performance mode for low-end devices

## 🎯 Component Architecture

### Base Components (shadcn/ui)
Located in `src/components/ui/`:
- Pre-built, accessible components
- Customizable with Tailwind CSS
- Consistent design system

### Business Components
Located in `src/components/`:
- `MenuCard` - Individual menu item display
- `MenuGrid` - Responsive menu layout
- `MenuHeader` - Restaurant branding and navigation
- `AdminDashboard` - Complete admin interface

### Hooks Pattern
Custom hooks for business logic:
- `useMenuData` - Restaurant and menu data management
- `useMenuFilters` - Filter state and logic
- `useMenuItemViews` - Analytics tracking
- `usePlayCanvasPreloader` - 3D model preloading

## 🌐 API Integration

### Service Layer
The `src/services/api.ts` file provides:
- Type-safe API methods
- Error handling and retry logic
- Response transformation
- Loading state management

### Data Flow
```
Component → Custom Hook → API Service → Backend
```

Example:
```typescript
// In component
const { menuItems, loading } = useMenuData();

// In hook
const { data: menuItems } = useQuery('menuItems', menuItemsApi.getAll);

// In service
export const menuItemsApi = {
  getAll: () => api.get('/menu-items')
};
```

## 🎨 Styling & Theming

### TailwindCSS Configuration
- Custom color palette
- Responsive breakpoints
- Component variants
- Animation utilities

### Theme System
- CSS variables for dynamic theming
- Dark/light mode support
- Restaurant branding integration
- Consistent spacing and typography

## 🔍 Testing

### Testing Strategy
- Component testing with React Testing Library
- Integration testing for user flows
- Visual regression testing for UI components
- Performance testing for 3D features

### Test Files
```bash
# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

## 📦 Build & Deployment

### Production Build
```bash
yarn build
```

Generates optimized static files in the `build/` directory:
- Minified JavaScript and CSS
- Optimized images and assets
- Service worker for caching
- Source maps for debugging

### Deployment Considerations
- Static file hosting (Netlify, Vercel, etc.)
- CDN configuration for assets
- Environment variable configuration
- HTTPS requirement for modern features

## 🐛 Troubleshooting

### Common Issues

**Development server not starting:**
- Check Node.js version (16+ required)
- Clear node_modules and reinstall
- Check for port conflicts

**3D models not loading:**
- Verify file formats are supported
- Check CORS configuration
- Ensure proper file paths

**Build failures:**
- Check TypeScript errors
- Verify all dependencies are installed
- Review environment variables

### Debug Mode
Enable debug logging in development:
```typescript
// In browser console
localStorage.setItem('debug', 'menu:*');
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes with TypeScript
3. Add/update tests
4. Run linting and type checking
5. Create pull request

### Code Standards
- Follow existing patterns and conventions
- Write meaningful component and function names
- Add JSDoc comments for complex logic
- Ensure responsive design compatibility

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Query Documentation](https://tanstack.com/query/latest)
