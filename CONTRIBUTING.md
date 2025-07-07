# Contributing to Restaurant Menu Management System

Thank you for considering contributing to the Restaurant Menu Management System! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub Issues page to report bugs or request features
- Search existing issues before creating new ones
- Provide detailed information including steps to reproduce
- Include system information and browser details when relevant

### Submitting Changes
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Add or update tests as necessary
5. Update documentation if needed
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🏗️ Development Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB
- Git

### Local Development
1. Clone your fork
2. Install dependencies:
   ```bash
   cd frontend && yarn install
   cd ../backend && pip install -r requirements.txt
   ```
3. Set up environment variables
4. Start development servers
5. Make your changes
6. Test thoroughly

## 📝 Coding Standards

### Frontend (React/TypeScript)
- Use TypeScript for all new code
- Follow existing component patterns
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful component names
- Add JSDoc comments for complex logic

### Backend (Python/FastAPI)
- Follow PEP 8 style guidelines
- Use type hints for all functions
- Write docstrings for modules and functions
- Use async/await for database operations
- Implement proper error handling

### General Guidelines
- Write clear, self-documenting code
- Add comments for complex business logic
- Use meaningful variable and function names
- Keep functions small and focused
- Follow existing patterns and conventions

## 🧪 Testing

### Frontend Testing
- Write unit tests for components
- Use React Testing Library for component testing
- Test user interactions and edge cases
- Ensure accessibility compliance

### Backend Testing
- Write unit tests for API endpoints
- Test database operations
- Verify error handling
- Check authentication and authorization

### Running Tests
```bash
# Frontend tests
cd frontend && yarn test

# Backend tests
cd backend && python -m pytest
```

## 📖 Documentation

### Code Documentation
- Add JSDoc comments for React components
- Document props and their types
- Explain complex algorithms or business logic
- Update README files when adding features

### API Documentation
- Update OpenAPI schemas when modifying endpoints
- Document new environment variables
- Explain configuration options

## 🚀 Feature Development

### New Features
1. Discuss major features in issues first
2. Break large features into smaller PRs
3. Update documentation
4. Add appropriate tests
5. Consider backward compatibility

### 3D Model Support
- Test with various file formats
- Ensure mobile device compatibility
- Implement proper fallbacks
- Consider performance implications

### UI/UX Changes
- Maintain accessibility standards
- Test on multiple devices and browsers
- Follow existing design patterns
- Consider internationalization

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Branch is up to date with main
- [ ] Commit messages are clear

### PR Description
- Clearly describe the changes
- Link related issues
- Include screenshots for UI changes
- List any breaking changes
- Mention if new dependencies are added

### Review Process
- Maintainers will review PRs
- Address feedback promptly
- Keep discussions respectful and constructive
- Be open to suggestions and improvements

## 🏷️ Commit Message Format

Use clear, descriptive commit messages:
```
feat: add 3D model preloading for better performance
fix: resolve menu item filtering issue
docs: update API documentation
test: add unit tests for menu component
refactor: improve error handling in API service
```

## 🌟 Code Review Guidelines

### For Contributors
- Be open to feedback
- Explain complex changes
- Respond to review comments
- Keep PRs focused and manageable

### For Reviewers
- Be constructive and helpful
- Explain suggestions clearly
- Focus on code quality and best practices
- Consider performance and security implications

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Project Specific
- Project README for setup instructions
- API documentation at `/docs` endpoint
- Component documentation in Storybook (if available)

## ❓ Questions and Support

- Create an issue for questions about contributing
- Join discussions in existing issues
- Check documentation first
- Be patient and respectful

## 🎯 Areas for Contribution

### High Priority
- Performance optimizations
- Accessibility improvements
- Mobile experience enhancements
- Test coverage improvements

### Features
- New 3D model formats
- Additional dietary filters
- Analytics dashboard enhancements
- Multi-language support

### Documentation
- API examples and tutorials
- Component usage guides
- Deployment instructions
- Architecture documentation

Thank you for contributing to making restaurant digital menus better for everyone! 🍽️