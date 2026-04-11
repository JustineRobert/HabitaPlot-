# Contributing to HabitaPlot™

Thank you for your interest in contributing to HabitaPlot™! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all contributors to:

- Be respectful and professional in all interactions
- Welcome diverse perspectives and backgrounds
- Provide constructive feedback
- Report unacceptable behavior to the project maintainers

## Getting Started

### Prerequisites

- Node.js v18+ and npm v9+
- Docker and Docker Compose
- Git
- Familiarity with React, Express.js, and PostgreSQL

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/habitaplot.git
   cd habitaplot
   ```

3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**:
   ```bash
   # Using Docker (recommended)
   docker-compose -f docker/docker-compose.yml up -d

   # Or locally
   cd backend && npm install
   cd ../frontend && npm install
   ```

5. **Set up environment files**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp docker/.env.example docker/.env
   ```

6. **Start development servers**:
   ```bash
   # With Docker
   docker-compose -f docker/docker-compose.yml up

   # Or locally
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm start
   ```

## Development Process

### Feature Development Workflow

1. **Create a feature branch** with a descriptive name:
   ```bash
   git checkout -b feature/user-authentication
   git checkout -b feature/listing-search
   git checkout -b fix/auth-token-expiry
   git checkout -b docs/api-reference
   ```

2. **Make your changes** following the coding standards

3. **Test your changes** thoroughly (see [Testing](#testing))

4. **Commit your changes** with clear, descriptive messages

5. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** and reference any related issues

### Branch Naming Conventions

- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates
- `test/*` - Test additions or updates
- `chore/*` - Build, CI, dependencies, etc.

### Working with Issues

- Check existing issues before creating new ones
- Use descriptive titles and detailed descriptions
- Label issues appropriately
- Link related PRs to issues

## Commit Guidelines

### Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
git commit -m "feat(auth): add JWT refresh token rotation"
git commit -m "fix(listing): fix price filter precision issue"
git commit -m "docs(api): update endpoint documentation"
git commit -m "test(search): add filtering tests"
git commit -m "refactor(db): optimize user query performance"
```

### Types

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that don't affect functionality (formatting, etc.)
- `refactor` - Code refactoring without changing functionality
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build, dependencies, CI configuration

### Guidelines

- Use imperative mood ("add feature" not "added feature")
- Don't capitalize the first letter
- No period at the end of the subject line
- Limit subject line to 50 characters
- Wrap body at 72 characters
- Explain what and why, not how

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run linting and tests**:
   ```bash
   cd backend && npm run lint && npm run test
   cd ../frontend && npm run lint && npm run test
   ```

3. **Build the project**:
   ```bash
   cd frontend && npm run build
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Related Issues
Closes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
Description of testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings generated
- [ ] Screenshots added (if UI changes)
```

### PR Review Process

1. At least 2 approvals required
2. All CI checks must pass
3. No merge conflicts
4. Code coverage maintained/improved
5. Maintainer final approval

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ syntax
- Use `const` by default, `let` for loop counters
- Use arrow functions (`=>`) when appropriate
- Use template literals for string interpolation
- 2-space indentation
- Max line length: 100 characters

### File Structure

**Backend:**
```
src/
  config/       - Configuration files
  controllers/  - Request handlers
  middleware/   - Middleware functions
  models/       - Database models
  routes/       - Route definitions
  services/     - Business logic
  utils/        - Utility functions
  index.js      - Entry point
```

**Frontend:**
```
src/
  components/   - Reusable components
  pages/        - Page components
  services/     - API services
  hooks/        - Custom React hooks
  utils/        - Utility functions
  App.js        - Root component
  index.js      - Entry point
```

### Best Practices

- Single Responsibility Principle: Each module should have one reason to change
- DRY (Don't Repeat Yourself): Avoid code duplication
- Error Handling: Always handle errors appropriately
- Comments: Comment complex logic, not obvious code
- Naming: Use clear, descriptive names for variables and functions
- No console logs: Use proper logging utilities
- Security: Never commit secrets or sensitive data

### React Components

```jsx
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

export const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Setup and cleanup
  }, []);

  return (
    <div>Content</div>
  );
};

export default MyComponent;
```

### Express Routes/Controllers

```javascript
// controllers/exampleController.js
export const getExample = async (req, res, next) => {
  try {
    // Handler logic
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// routes/exampleRoutes.js
import { getExample } from '../controllers/exampleController.js';
router.get('/example', authMiddleware, getExample);
```

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm run test

# Run specific test file
npm run test -- auth.test.js

# Run with coverage
npm run test -- --coverage
```

### Frontend Testing

```bash
cd frontend

# Run all tests
npm run test

# Run specific test file
npm run test -- MyComponent.test.js

# Run with coverage
npm run test -- --coverage --watchAll=false
```

### Test Guidelines

- Write tests for all new features
- Maintain at least 80% code coverage
- Use descriptive test names
- Follow the Arrange-Act-Assert (AAA) pattern
- Mock external dependencies
- Test both happy path and error cases

### Example Test Structure

```javascript
describe('Auth Service', () => {
  describe('login', () => {
    it('should return a token on successful login', async () => {
      // Arrange
      const credentials = { email: 'user@example.com', password: 'password' };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result).toHaveProperty('token');
    });

    it('should throw error on invalid credentials', async () => {
      // Arrange
      const credentials = { email: 'user@example.com', password: 'invalid' };

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow();
    });
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments to functions:
  ```javascript
  /**
   * Authenticates a user with email and password
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<{token: string}>} Authentication token
   * @throws {Error} If credentials are invalid
   */
  export const login = async (email, password) => {
    // Implementation
  };
  ```

- Document complex algorithms and business logic
- Keep documentation in sync with code

### Project Documentation

- Update README.md for significant changes
- Add API documentation in docs/API.md
- Update deployment guides if infrastructure changes
- Document breaking changes in CHANGELOG.md

## Reporting Issues

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if visual issue)
- Environment details (Node version, OS, etc.)
- Error logs or stack traces

## Questions?

- Check [GETTING_STARTED.md](./GETTING_STARTED.md) for setup help
- Review [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design
- Check existing issues and discussions
- Contact project maintainers

## License

By contributing to HabitaPlot™, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to HabitaPlot™! 🎉**
