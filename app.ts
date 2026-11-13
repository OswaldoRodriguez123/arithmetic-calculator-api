import express, { Express, NextFunction, Request, Response } from 'express';
import routes from '@/common/routes';
import cors from 'cors';

export const API_URL = '/api/v1';

export const createApp = () => {

  const router = express.Router();
  const app: Express = express();

  // Single trusted proxy hop (Render/typical PaaS) so req.ip and the
  // rate limiter see the real client IP instead of the proxy's.
  app.set('trust proxy', 1);

  app.use(express.json());

  routes.forEach(function (item) {
    router.use(item.route, cors(), item.handler)
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
