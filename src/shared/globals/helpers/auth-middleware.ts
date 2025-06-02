import { Request, Response, NextFunction } from 'express';
import Jwt from 'jsonwebtoken';
import { config } from 'src/config';
import { Unauthorized } from './error-handler';
import { AuthPayload } from 'src/features/auth/interfaces/auth.interface';

export class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new Unauthorized('Token is not available. Please login again.');
    }
    try {
      const payload: AuthPayload = Jwt.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Unauthorized('Token is invalid. Please login again.');
    }
    next();
  }

  public checkAutentication(req: Request, res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new Unauthorized('Autentication is required to acces this route.');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
