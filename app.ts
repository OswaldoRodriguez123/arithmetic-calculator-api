import express, { Express } from 'express';
import routes from '@/common/routes';
import cors from 'cors';

export const API_URL = '/api/v1';

export const createApp = () => {

  const router = express.Router();
  const app: Express = express();

  app.use(express.json());

  routes.forEach(function (item) {
    router.use(item.route, cors(), item.handler)
  });

  app.use(API_URL, router);

  return app;
}