import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { userService } from 'src/shared/services/db/user.service';
import { UserCache } from 'src/shared/services/redis/user.cache';

const userCache: UserCache = new UserCache();

export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`); // ako user postoji u cache memoriji super , uzmi ga ako ne idi u bazu nadji ga
    if (Object.keys(existingUser).length) {
      //proveravamo da li ima lepe vrednosti ne undefined ili empty
      isUser = true;
      token = req.session?.Jwt;
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
