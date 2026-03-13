import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const developerOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  if (user.email !== process.env.DEVELOPER_EMAIL) {
    return res.status(403).json({
      success: false,
      error: 'ACCESS_DENIED',
      message: 'Admin access is restricted to authorized developer only'
    });
  }

  next();
};
