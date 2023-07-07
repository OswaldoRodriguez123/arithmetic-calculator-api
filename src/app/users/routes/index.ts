import express, { Response, Request } from 'express';
import UserController from '@/app/users/controllers';

const router = express.Router();
const controller = new UserController();

router.post('/login', async(req: Request, res: Response) => {
  const user = await controller.login(req.body);
  return res.status(200).json({ status: user ? 200 : 404, data: user });
});

export default router;