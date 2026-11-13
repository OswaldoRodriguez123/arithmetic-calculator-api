import express, { Response, Request, NextFunction } from 'express';
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

router.delete('/:id', isAuth, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const affected = await controller.delete(req.params.id, req.params.userId);
    if (affected === 0) {
      // 404 carries no information about whether the record exists and
      // belongs to someone else, or does not exist at all.
      return res.status(404).json({ message: 'Record not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err as Error);
  }
});

export default router;