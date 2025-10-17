import request from 'supertest';
import app from '../src/app.js';

describe('App routes', () => {
  it('GET / should return hello message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Node CI/CD demo');
  });

  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /version should return version', async () => {
    const res = await request(app).get('/version');
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.version).toBe('string');
  });
});
