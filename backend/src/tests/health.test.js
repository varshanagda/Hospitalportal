import request from 'supertest';
import app from '../server';

describe('Backend health', () => {
  it('GET / should return backend running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('backend is running');
  });

  it('should export express app', () => {
    expect(app).toBeDefined();
  });
});
