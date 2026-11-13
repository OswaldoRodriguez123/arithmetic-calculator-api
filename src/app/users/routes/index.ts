import express, { Response, Request, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { envNumber } from '@/config/env';
import UserController from '@/app/users/controllers';
import { loginSchema } from '@/app/users/schemas';

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

    return res.status(200).json({ status: 200, data: user });
  } catch (err) {
    return next(err);
  }
});

export default router;
