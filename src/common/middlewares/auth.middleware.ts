import { Request, Response, NextFunction  } from 'express';
import { verifyToken } from '../services/jwt.service'
import { User } from '@/app/users/models';

interface ErrorResponse extends Error {
  statusCode?: number;
}

export default async (req: Request, res: Response, next: NextFunction) => {

  let error: ErrorResponse | null = null;
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      error = new Error('No header');
      error.statusCode = 401;
      return;
    }
    const token = authHeader.split(' ')[1];

    const decodedToken = verifyToken(token)

    if (!decodedToken) {
      error = new Error('No auth');
      error.statusCode = 401;
    }
    req.params.userId = (decodedToken as User).id || '';
  } catch (err) {
    error = err as ErrorResponse;
    error.statusCode = 401;
  }

  if (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    })
  } else {
    next()
  }
};