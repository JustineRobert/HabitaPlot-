/**
 * Authentication middleware tests
 */

const request = require('supertest');
const express = require('express');
const { authMiddleware, authenticatedMiddleware, adminMiddleware } = require('../../../src/middleware/auth');
const { generateToken } = require('../../../src/utils/auth');

describe('Auth Middleware', () => {
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    app = express();
    app.use(express.json());
    app.get('/protected', authMiddleware, (req, res) => {
      res.status(200).json({ user: req.user });
    });
    app.get('/authenticated', authenticatedMiddleware, (req, res) => {
      res.status(200).json({ success: true });
    });
    app.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
      res.status(200).json({ admin: true });
    });
  });

  it('should reject requests without authorization header', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('AuthenticationError');
  });

  it('should reject requests with invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid.token');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('AuthenticationError');
  });

  it('should allow requests with a valid token', async () => {
    const token = generateToken({ userId: 'user-1', role: 'user' });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty('userId', 'user-1');
  });

  it('should reject authenticated middleware when no user is attached', async () => {
    const response = await request(app).get('/authenticated');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('AuthenticationError');
  });

  it('should reject admin access for non-admin users', async () => {
    const token = generateToken({ userId: 'user-1', role: 'user' });

    const response = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('AuthorizationError');
  });

  it('should allow admin users to access admin route', async () => {
    const token = generateToken({ userId: 'admin-1', role: 'admin' });

    const response = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.admin).toBe(true);
  });
});
