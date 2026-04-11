# Testing Strategy & Guidelines

## Overview

This document outlines the testing strategy for HabitaPlot™, covering unit tests, integration tests, and end-to-end tests.

## Testing Pyramid

```
        E2E Tests (5%)
       /           \
      /   Manual    \
     /   Testing    \
    /________________\
   /                  \
  /  Integration Tests \  (15%)
 /____________________\
/                      \
Unit Tests (80%)
______________________
```

## Test Coverage Goals

| Layer | Target Coverage | Priority |
|-------|-----------------|----------|
| Unit Tests | 80%+ | High |
| Integration Tests | 60%+ | Medium |
| E2E Tests | 50%+ | Medium |
| **Overall** | **70%+** | **High** |

---

## Backend Testing (Node.js + Express)

### Setup

```bash
# Install testing dependencies
npm install --save-dev jest supertest sinon

# Configure Jest (in package.json)
{
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": ["src/**/*.js"],
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

### Directory Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   └── utils/
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   ├── database/
│   │   └── auth/
│   ├── fixtures/
│   │   └── seedData.js
│   └── setup.js
└── package.json
```

### Unit Tests

#### Example: Auth Controller Test

```javascript
// tests/unit/controllers/authController.test.js
const { register, login, getCurrentUser } = require('../../../src/controllers/authController');
const User = require('../../../src/models/User');

jest.mock('../../../src/models/User');

describe('AuthController', () => {
  describe('register', () => {
    it('should create a new user with valid credentials', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      };
      const res = {
        json: jest.fn()
      };

      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.create.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        name: 'Test User'
      });

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(User.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: expect.any(String)
      }));
    });

    it('should reject duplicate email', async () => {
      const req = {
        body: {
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Email already registered'
      }));
    });
  });

  describe('login', () => {
    it('should return token with valid credentials', async () => {
      const req = {
        body: {
          email: 'user@example.com',
          password: 'password123'
        }
      };
      const res = {
        json: jest.fn()
      };

      const mockUser = {
        id: '123',
        email: 'user@example.com',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: expect.any(String)
      }));
    });

    it('should reject invalid password', async () => {
      const req = {
        body: {
          email: 'user@example.com',
          password: 'wrongpassword'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockUser = {
        id: '123',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
```

#### Example: Utility Test

```javascript
// tests/unit/utils/auth.test.js
const { hashPassword, comparePassword, generateToken, verifyToken } = require('../../../src/utils/auth');

describe('Auth Utils', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should compare password correctly', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword('wrongPassword', hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT Tokens', () => {
    it('should generate valid token', () => {
      const userId = '123';
      const token = generateToken(userId);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should verify token correctly', () => {
      const userId = '123';
      const token = generateToken(userId);

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
    });

    it('should reject expired token', () => {
      // Create an expired token
      const expiredToken = generateToken('123', '1s');
      
      setTimeout(() => {
        expect(() => verifyToken(expiredToken)).toThrow();
      }, 1100);
    });
  });
});
```

### Integration Tests

#### Example: Auth API Integration Test

```javascript
// tests/integration/api/auth.test.js
const request = require('supertest');
const app = require('../../../src/index');
const sequelize = require('../../../src/config/database').sequelize;
const User = require('../../../src/models/User');

describe('Auth API Integration', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset DB for tests
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /auth/register', () => {
    it('should register new user and return token', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');

      const user = await User.findOne({ where: { email: 'newuser@example.com' } });
      expect(user).toBeTruthy();
    });

    it('should reject duplicate email', async () => {
      const response1 = await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'User 1'
        });

      expect(response1.status).toBe(201);

      const response2 = await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'differentpassword',
          name: 'User 2'
        });

      expect(response2.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
          name: 'Test User'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    let token;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          email: 'userprofile@example.com',
          password: 'password123',
          name: 'Profile User'
        });

      token = registerResponse.body.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'userprofile@example.com');
      expect(response.body).toHaveProperty('name', 'Profile User');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- tests/unit/controllers/authController.test.js

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch

# Run specific test suite
npm run test -- -t "Auth Controller"
```

---

## Frontend Testing (React)

### Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest

# Configure Jest in package.json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"],
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
  }
}
```

### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── integration/
│   │   └── flows/
│   ├── fixtures/
│   │   └── mockData.js
│   └── setup.js
└── package.json
```

### Unit Tests

#### Example: Component Test

```javascript
// src/components/__tests__/Navbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  it('should render logo and navigation links', () => {
    authService.isAuthenticated.mockReturnValue(false);

    renderWithRouter(<Navbar />);

    expect(screen.getByText(/HabitaPlot/i)).toBeInTheDocument();
    expect(screen.getByText(/Search/i)).toBeInTheDocument();
  });

  it('should show login/signup for unauthenticated users', () => {
    authService.isAuthenticated.mockReturnValue(false);

    renderWithRouter(<Navbar />);

    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it('should show dashboard and logout for authenticated users', () => {
    authService.isAuthenticated.mockReturnValue(true);

    renderWithRouter(<Navbar />);

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('should toggle mobile menu on click', () => {
    authService.isAuthenticated.mockReturnValue(false);

    renderWithRouter(<Navbar />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole('navigation')).toHaveClass('active');
  });

  it('should call logout on logout button click', () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.logout.mockImplementation(() => {
      authService.isAuthenticated.mockReturnValue(false);
    });

    renderWithRouter(<Navbar />);

    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    expect(authService.logout).toHaveBeenCalled();
  });
});
```

#### Example: Service Test

```javascript
// src/services/__tests__/authService.test.js
import * as authService from '../authService';
import * as api from '../api';

jest.mock('../api');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    it('should register user and store token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = {
        token: 'jwt-token-123',
        refreshToken: 'refresh-token-456'
      };

      api.post.mockResolvedValue(response);

      await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(localStorage.getItem('token')).toBe('jwt-token-123');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token-456');
    });

    it('should throw error on duplicate email', async () => {
      api.post.mockRejectedValue(new Error('Email already registered'));

      expect(async () => {
        await authService.register({ email: 'existing@example.com' });
      }).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login and store credentials', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'password123'
      };

      const response = {
        token: 'jwt-token-789',
        user: { id: '123', email: 'user@example.com' }
      };

      api.post.mockResolvedValue(response);

      await authService.login(credentials);

      expect(localStorage.getItem('token')).toBe('jwt-token-789');
      expect(localStorage.getItem('user')).toContain('user@example.com');
    });
  });

  describe('logout', () => {
    it('should clear stored credentials', () => {
      localStorage.setItem('token', 'jwt-token');
      localStorage.setItem('user', JSON.stringify({ id: '123' }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('token', 'jwt-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false if token missing', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
```

### Integration Tests

#### Example: Login Flow Test

```javascript
// src/__tests__/integration/loginFlow.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

describe('Login Flow Integration', () => {
  it('should complete full login flow', async () => {
    const user = userEvent.setup();

    authService.login.mockResolvedValue({
      token: 'jwt-token',
      user: { id: '123', email: 'test@example.com' }
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Click login link
    const loginLink = screen.getByText(/Login/i);
    await user.click(loginLink);

    // Enter credentials
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Wait for redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- Navbar.test.js

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch

# Update snapshots
npm run test -- -u
```

---

## E2E Testing (Cypress)

### Setup

```bash
npm install --save-dev cypress

# Initialize Cypress
npx cypress open
```

### Example: E2E Test

```javascript
// cypress/e2e/auth.cy.js
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should register new user', () => {
    cy.get('a').contains('Sign Up').click();
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button').contains('Register').click();

    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });

  it('should login existing user', () => {
    cy.get('a').contains('Login').click();
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button').contains('Login').click();

    cy.url().should('include', '/dashboard');
  });

  it('should search listings', () => {
    cy.get('input[placeholder="Search properties..."]').type('Plot');
    cy.get('button').contains('Search').click();

    cy.url().should('include', '/search');
    cy.get('[data-testid="listing-card"]').should('have.length.greaterThan', 0);
  });

  it('should view listing details', () => {
    cy.get('[data-testid="listing-card"]').first().click();

    cy.url().should('include', '/listings/');
    cy.get('h1').should('exist');
    cy.get('p').should('contain', 'Price');
  });
});
```

---

## Testing Checklist

### Before Commit
- [ ] All unit tests pass
- [ ] Code coverage > 80% (backend) / 75% (frontend)
- [ ] No console errors or warnings
- [ ] No linting errors

### Before Pull Request
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Documentation updated if needed
- [ ] Performance acceptable

### Before Merge to Main
- [ ] All tests pass in CI/CD
- [ ] Code review approved
- [ ] E2E tests pass (if applicable)
- [ ] No breaking changes documented

---

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **AAA Pattern**: Arrange (setup) → Act (execute) → Assert (verify)
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies
5. **Coverage**: Aim for high coverage but focus on critical paths
6. **Speed**: Keep tests fast; use mocks instead of real APIs
7. **Maintenance**: Keep tests updated with code changes

---

**Last Updated**: January 2024  
**Version**: 1.0
