import request from 'supertest';
import { createApp, API_URL } from '../../../../app';
import { UserRepository } from '../repositories';
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

  test('returns 200 with a token and no password when credentials are valid', async () => {
    const user = { id: '1', name: 'User 1', password: 'hashed' };
    jest.spyOn(UserRepository.prototype, 'getByUsername').mockResolvedValue(user);
    jest.spyOn(commonFunctions, 'compareHash').mockReturnValue(true);

    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .send({ username: 'user1', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.password).toBeUndefined();
  });

  test('returns 400 with a generic body when the payload is not valid JSON', async () => {
    const res = await request(app)
      .post(`${API_URL}/auth/login`)
      .set('Content-Type', 'application/json')
      .send('{"username": "user1",');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid request body' });
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
