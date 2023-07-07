
import express, { Response, Request } from 'express';
import OperationController from '@/app/operations/controllers';
import isAuth from '@/common/middlewares/auth.middleware';

const router = express.Router();
const controller = new OperationController();

router.get('/', isAuth, async(req: Request, res: Response) => {
  const operations = await controller.getAll();
  return res.status(200).json({ status: 200, data: operations });
});

export default router;