/**
 * Basic integration tests for the backend Express application
 */

const request = require('supertest');
const app = require('../../../src/index');

describe('Backend app integration', () => {
  it('responds to health check', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ status: 'ok' }));
  });

  it('responds to API version endpoint', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ name: 'HabitaPlot API', status: 'running' }));
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('NotFoundError');
  });
});
