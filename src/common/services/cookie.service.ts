import { CookieOptions } from 'express';
import { EXPIRATION_TIME } from './jwt.service';

export const ACCESS_TOKEN_COOKIE = 'access_token';

/**
 * httpOnly cookie that carries the session JWT. The token is never exposed
 * to JavaScript (no XSS token theft). In production (SPA and API on
 * different sites, e.g. GitHub Pages -> Render) the cookie must be
 * SameSite=None + Secure; over plain http://localhost it stays Lax.
 */
export function accessTokenCookieOptions(): CookieOptions {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: EXPIRATION_TIME * 1000, // express wants milliseconds
  };
}
