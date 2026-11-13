import request from 'supertest';
import { createApp, API_URL } from '../../../../app';
import { UserRepository } from '../repositories';
import { UserEntity } from '@/common/entities';
import * as commonFunctions from '../utils/common';

const app = createApp();

describe('POST /auth/login', () => {
  test('returns 400 when password is not a string', async () => {
    const repoSpy = jest.spyOn(UserRepository.prototype, 'getByUsername');

    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .send({ username: 'user1', password: { x: 1 } });

    expect(res.status).toBe(400);
    expect(repoSpy).not.toHaveBeenCalled();
    repoSpy.mockRestore();
  });

  test('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .send({ password: 'secret123' });

    expect(res.status).toBe(400);
  });

  test('returns 401 with a generic message when the user does not exist', async () => {
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(null);
    jest.spyOn(commonFunctions, 'compareHash').mockReturnValue(false);

    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .send({ username: 'nosuchuser', password: 'secret123' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  test('returns 401 when the password does not match', async () => {
    const user = { id: '1', name: 'User 1', password: 'hashed' };
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(user);
    jest.spyOn(commonFunctions, 'compareHash').mockReturnValue(false);

    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .send({ username: 'user1', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  test('returns 200 with an httpOnly access_token cookie and no token in the body when credentials are valid', async () => {
    const user = { id: '1', name: 'User 1', username: 'user1', password: 'hashed' };
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(user as any);
    jest.spyOn(commonFunctions, 'compareHash').mockReturnValue(true);

    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .send({ username: 'user1', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.data.token).toBeUndefined();
    expect(res.body.data.password).toBeUndefined();

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const accessToken = (setCookie as unknown as string[]).find((c) => c.startsWith('access_token='));
    expect(accessToken).toBeDefined();
    expect(accessToken).toMatch(/HttpOnly/i);
    expect(accessToken).toMatch(/Path=\//i);
    expect(accessToken).toMatch(/SameSite=Lax/i); // test env is not production
  });

  test('returns 400 with a generic body when the payload is not valid JSON', async () => {
    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .set('Content-Type', 'application/json')
      .send('{"username": "user1",');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid request body' });
  });

  test('POST /auth/logout clears the access_token cookie and returns 204', async () => {
    const res = await request(app).post(`${API_URL}/auth/logout`);

    expect(res.status).toBe(204);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cleared = (setCookie as unknown as string[]).find((c) => c.startsWith('access_token='));
    expect(cleared).toBeDefined();
    expect(cleared).toMatch(/access_token=;/); // emptied value
    expect(cleared).toMatch(/Path=\//i);
  });

  test('GET /auth/me returns 401 without credentials', async () => {
    const res = await request(app).get(`${API_URL}/auth/me`);

    expect(res.status).toBe(401);
  });

  test('GET /auth/me returns the public profile with a valid session cookie, without the password hash', async () => {
    const loginUser = { id: '1', name: 'User 1', username: 'user1', password: 'hashed' };
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(loginUser as any);
    jest.spyOn(commonFunctions, 'compareHash').mockReturnValue(true);
    jest.spyOn(UserEntity, 'findByPk').mockResolvedValue(
      UserEntity.build({ id: '1', username: 'user1', status: 'active' } as any) as any
    );
    jest.spyOn(UserRepository.prototype, 'getById').mockResolvedValue(
      { id: '1', name: 'User 1', username: 'user1', password: 'hashed-secret', status: 'active' } as any
    );

    const loginRes = await request(app)
      .post(`${API_URL}/auth/login`)
      .send({ username: 'user1', password: 'secret123' });
    const cookie = (loginRes.headers['set-cookie'] as unknown as string[]).find((c) => c.startsWith('access_token='))!;

    const res = await request(app)
      .get(`${API_URL}/auth/me`)
      .set('Cookie', cookie.split(';')[0]);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: '1', name: 'User 1', username: 'user1' });
    expect(JSON.stringify(res.body)).not.toContain('hashed-secret');
  });

  test('GET /auth/me returns 401 when the session cookie is garbage', async () => {
    const res = await request(app)
      .get(`${API_URL}/auth/me`)
      .set('Cookie', 'access_token=not-a-token');

    expect(res.status).toBe(401);
  });

  test('returns 429 when the per-IP login limit is exceeded', async () => {
    const previous = process.env.LOGIN_RATE_LIMIT_MAX;
    process.env.LOGIN_RATE_LIMIT_MAX = '3';
    try {
      let limitedApp: ReturnType<typeof createApp> | undefined;
      jest.isolateModules(() => {
        // Re-require with the low limit so the limiter is built with it.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('../../../../app');
        limitedApp = mod.createApp();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const repo = require('../repositories');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const common = require('../utils/common');
        jest.spyOn(repo.UserRepository.prototype, 'getByUsername').mockResolvedValue(null);
        jest.spyOn(common, 'compareHash').mockReturnValue(false);
      });

      for (let i = 0; i < 3; i++) {
        await request(limitedApp!).post(`${API_URL}/auth/login`).send({ username: 'u', password: 'p' });
      }
      const res = await request(limitedApp!)
        .post(`${API_URL}/auth/login`)
        .send({ username: 'u', password: 'p' });

      expect(res.status).toBe(429);
    } finally {
      process.env.LOGIN_RATE_LIMIT_MAX = previous;
      jest.restoreAllMocks();
    }
  });
});
