import express, { Response, Request, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { envNumber } from '@/config/env';
import UserController from '@/app/users/controllers';
import { loginSchema } from '@/app/users/schemas';
import isAuth from '@/common/middlewares/auth.middleware';
import { ACCESS_TOKEN_COOKIE, accessTokenCookieOptions } from '@/common/services/cookie.service';

const router = express.Router();
const controller = new UserController();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: envNumber('LOGIN_RATE_LIMIT_MAX', 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later' },
});

const usernameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: envNumber('LOGIN_USERNAME_RATE_LIMIT_MAX', 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => String(req.body?.username ?? '').toLowerCase().slice(0, 100),
  message: { message: 'Too many login attempts, please try again later' },
});

router.post('/login', loginLimiter, usernameLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const user = await controller.login(parsed.data);
    if (!user) {
      console.warn(JSON.stringify({ event: 'login_failed', username: parsed.data.username }));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // The JWT travels in an httpOnly cookie, never in the response body:
    // JavaScript (and any XSS running on the SPA origin) cannot read it.
    const token = user.token;
    if (!token) {
      return next(new Error('Token missing after login'));
    }
    delete user.token;
    res.cookie(ACCESS_TOKEN_COOKIE, token, accessTokenCookieOptions());
    return res.status(200).json({ status: 200, data: user });
  } catch (err) {
    return next(err);
  }
});

// Logout is idempotent and unauthenticated: clearing the cookie always wins,
// even with an expired or absent session.
router.post('/logout', (_req: Request, res: Response) => {
  const { maxAge, ...clearOptions } = accessTokenCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, clearOptions);
  return res.status(204).end();
});

// Session probe for the SPA: 200 with the user's public profile when the
// httpOnly cookie (or a Bearer token) is valid; 401 otherwise.
router.get('/me', isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params?.userId;
    const user = id ? await controller.getById(id) : null;
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.status(200).json({
      status: 200,
      data: { id: user.id, name: user.name, username: user.username },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
