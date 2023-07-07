import express, { Response, Request } from 'express';
import RecordController from '@/app/records/controllers';
import isAuth from '@/common/middlewares/auth.middleware';
import { Filters } from './../types';

const router = express.Router();
const controller = new RecordController();

router.get('/', isAuth, async(req: Request, res: Response) => {
  const query = req?.query as unknown;
  const params = query as Filters;
  params.userId = req.params.userId;
  const records = await controller.getAll(params);
  return res.status(200).json({ status: 200, data: records });
});

router.post('/', isAuth, async(req: Request, res: Response) => {
  req.body.userId = req.params.userId;
  const record = await controller.store(req.body);
  return res.status(200).json({ status: 200, data: record });
});

router.delete('/:id', isAuth, async(req: Request, res: Response) => {
  const record = await controller.delete(req.params.id);
  return res.status(200).json({ status: 200, data: record });
});

export default router;