import request from 'supertest';
import app from '../app';

let token: string;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({
    name: 'tester',
    email: 'tester@example.com',
    password: 'password',
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'tester@example.com',
    password: 'password',
  });

  token = res.body.token;
});

describe('Category API', () => {
  it('creates category', async () => {
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Root Category' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Root Category');
  });

  it('fetches category tree', async () => {
    await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Root' });

    const res = await request(app)
      .get('/api/category')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
