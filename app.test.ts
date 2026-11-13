import request from 'supertest';
import { createApp, API_URL } from './app';

describe('createApp', () => {
  test('sets common security headers via helmet', async () => {
    const res = await request(createApp()).get(`${API_URL}/nonexistent`);

    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('includes CORS headers on API responses (default: any origin)', async () => {
    const res = await request(createApp())
      .get(`${API_URL}/auth/login`)
      .set('Origin', 'https://example.com');

    expect(res.headers['access-control-allow-origin']).toBe('*');
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
