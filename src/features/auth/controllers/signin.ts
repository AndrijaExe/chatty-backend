import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import Jwt from 'jsonwebtoken';
import { config } from 'src/config';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { authService } from 'src/shared/services/db/auth.service';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { loginSchema } from '../schemes/signin';
import { IAuthDocument } from '../interfaces/auth.interface';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { userService } from 'src/shared/services/db/user.service';

export class SignIn {
  @joiValidation(loginSchema)
  public async Read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username); // samo preko username-a se trazi user za razliku od signup.ts
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials.');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials.');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
    //console.log(existingUser._id,typeof existingUser._id); // treba da bude 'object', ne 'string'
    const userJWT: string = Jwt.sign(
      {
        // dodajes samo one stvari koje mislis da su otp najzastupljenije i najbitnije
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJWT };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;
    res.status(HTTP_STATUS.OK).json({ message: 'User login succesfully', user: userDocument, token: userJWT });
  }
}
