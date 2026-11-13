import request from 'supertest';
import { createApp, API_URL } from './app';

describe('createApp', () => {
  test('sets common security headers via helmet', async () => {
    const res = await request(createApp()).get(`${API_URL}/nonexistent`);

    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('default CORS allows the local Vite dev server with credentials', async () => {
    const res = await request(createApp())
      .get(`${API_URL}/auth/login`)
      .set('Origin', 'http://localhost:3000');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  test('default CORS does not allow arbitrary origins', async () => {
    const res = await request(createApp())
      .get(`${API_URL}/auth/login`)
      .set('Origin', 'https://example.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('production refuses to boot without CORS_ORIGIN (cookie sessions need an allowlist)', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDatabasePassword = process.env.DATABASE_PASSWORD;
    const previousCorsOrigin = process.env.CORS_ORIGIN;
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_PASSWORD = previousDatabasePassword || 'test';
    delete process.env.CORS_ORIGIN;
    try {
      jest.isolateModules(() => {
        expect(() => require('./app')).toThrow(/CORS_ORIGIN/);
      });
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      if (previousDatabasePassword === undefined) {
        delete process.env.DATABASE_PASSWORD;
      } else {
        process.env.DATABASE_PASSWORD = previousDatabasePassword;
      }
      if (previousCorsOrigin !== undefined) {
        process.env.CORS_ORIGIN = previousCorsOrigin;
      }
    }
  });

  test('restricts CORS to CORS_ORIGIN when configured', async () => {
    const previous = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'https://ui.example.com';
    try {
      let restrictedApp: ReturnType<typeof createApp> | undefined;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        restrictedApp = require('./app').createApp();
      });

      const res = await request(restrictedApp!)
        .get(`${API_URL}/auth/login`)
        .set('Origin', 'https://ui.example.com');

      expect(res.headers['access-control-allow-origin']).toBe('https://ui.example.com');
    } finally {
      if (previous === undefined) {
        delete process.env.CORS_ORIGIN;
      } else {
        process.env.CORS_ORIGIN = previous;
      }
    }
  });
});
