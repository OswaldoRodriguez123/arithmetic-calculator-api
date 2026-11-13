import express, { Express, NextFunction, Request, Response } from 'express';
import routes from '@/common/routes';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { envString } from '@/config/env';

export const API_URL = '/api/v1';

// CORS must name explicit origins once cookies are in play: a wildcard is
// invalid with credentials, and reflecting any origin would hand the user's
// session cookie to every site. Production therefore requires CORS_ORIGIN;
// development defaults to the local Vite dev server (both localhost ports).
const corsOrigin = envString('CORS_ORIGIN', '');
if (!corsOrigin && process.env.NODE_ENV === 'production') {
  throw new Error(
    'CORS_ORIGIN is required in production when using cookie sessions (comma-separated list of allowed origins). See example.env.'
  );
}
const allowedOrigins = corsOrigin
  ? corsOrigin.split(',').map((s) => s.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

let corsOptions: cors.CorsOptions;
if (corsOrigin === '*') {
  console.warn('CORS_ORIGIN=* is legacy open mode: cookie sessions will not work cross-origin. Set explicit origins instead.');
  corsOptions = { origin: '*' };
} else {
  corsOptions = { origin: allowedOrigins, credentials: true };
}

export const createApp = () => {

  const router = express.Router();
  const app: Express = express();

  // Single trusted proxy hop (Render/typical PaaS) so req.ip and the
  // rate limiter see the real client IP instead of the proxy's.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());

  routes.forEach(function (item) {
    router.use(item.route, cors(corsOptions), item.handler)
  });

  app.use(API_URL, router);

  // Top-level error handler: malformed JSON bodies and unexpected errors
  // get a generic body; 500s are logged server-side only.
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const isBadBody = err?.type === 'entity.parse.failed' || err?.statusCode === 400;
    const status = isBadBody ? 400 : 500;
    if (status === 500) {
      console.error(err);
    }
    res.status(status).json({ message: isBadBody ? 'Invalid request body' : 'Internal server error' });
  });

  return app;
}
