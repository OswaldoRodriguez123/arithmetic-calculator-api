import { accessTokenCookieOptions, ACCESS_TOKEN_COOKIE } from './cookie.service';
import { EXPIRATION_TIME } from './jwt.service';

describe('accessTokenCookieOptions', () => {
  const previousNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  test('exports a stable cookie name', () => {
    expect(ACCESS_TOKEN_COOKIE).toBe('access_token');
  });

  test('httpOnly, path /, maxAge derived from JWT_EXPIRATION_SECONDS, Lax over plain http', () => {
    process.env.NODE_ENV = 'test';
    const opts = accessTokenCookieOptions();

    expect(opts.httpOnly).toBe(true);
    expect(opts.path).toBe('/');
    expect(opts.secure).toBe(false);
    expect(opts.sameSite).toBe('lax');
    expect(opts.maxAge).toBe(EXPIRATION_TIME * 1000);
  });

  test('production (cross-site SPA): SameSite=None + Secure so the cookie is accepted', () => {
    process.env.NODE_ENV = 'production';
    const opts = accessTokenCookieOptions();

    expect(opts.secure).toBe(true);
    expect(opts.sameSite).toBe('none');
  });
});
