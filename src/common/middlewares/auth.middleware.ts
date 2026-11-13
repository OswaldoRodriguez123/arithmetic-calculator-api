import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenData } from '../services/jwt.service';
import { UserEntity } from '@/common/entities';

interface ErrorResponse extends Error {
  statusCode?: number;
}

export default async (req: Request, res: Response, next: NextFunction) => {
  let error: ErrorResponse | null = null;
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      error = new Error('Missing Authorization header');
      error.statusCode = 401;
    } else {
      const token = authHeader.split(' ')[1];

      let decodedToken: TokenData | null = null;
      try {
        decodedToken = verifyToken(token) as TokenData;
      } catch (verifyErr) {
        error = new Error('Invalid token');
        error.statusCode = 401;
      }

      if (!error) {
        const id = decodedToken?.id;
        if (!decodedToken || typeof id !== 'string' || id.trim().length === 0) {
          error = new Error('Invalid token');
          error.statusCode = 401;
        } else {
          try {
            const user = await UserEntity.findByPk(id, { attributes: ['id', 'status'] });
            if (!user || (user as any).status !== 'active') {
              error = new Error('Invalid token');
              error.statusCode = 401;
            } else {
              req.params.userId = id;
            }
          } catch (dbErr) {
            console.error(dbErr);
            error = new Error('Internal server error');
            error.statusCode = 500;
          }
        }
      }
    }
  } catch (err) {
    error = err as ErrorResponse;
    if (!error.statusCode) error.statusCode = 401;
  }

  if (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: statusCode >= 500 ? 'Internal server error' : error.message,
    });
  } else {
    next();
  }
};
