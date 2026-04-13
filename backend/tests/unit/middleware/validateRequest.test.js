/**
 * Request validation middleware unit tests
 */

const express = require('express');
const request = require('supertest');
const { body } = require('express-validator');
const validateRequest = require('../../../src/middleware/validateRequest');

describe('validateRequest middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post(
      '/test',
      [body('email').isEmail().withMessage('A valid email is required'), validateRequest],
      (req, res) => {
        res.status(200).json({ success: true });
      }
    );
  });

  it('returns 200 for valid payloads', async () => {
    const response = await request(app).post('/test').send({ email: 'test@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('returns 400 for invalid payloads', async () => {
    const response = await request(app).post('/test').send({ email: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'ValidationError',
        message: 'Invalid request payload'
      })
    );
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: 'email', message: 'A valid email is required' })
      ])
    );
  });
});
