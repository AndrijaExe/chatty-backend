import express, { Router } from 'express';
import { CurrentUser } from '../controllers/current-user';
import { authMiddleware } from 'src/shared/globals/helpers/auth-middleware';
class CurrentUserRouth {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/currentuser', authMiddleware.checkAutentication, CurrentUser.prototype.read);
    return this.router;
  }
}

export const currentUserRouth: CurrentUserRouth = new CurrentUserRouth();
