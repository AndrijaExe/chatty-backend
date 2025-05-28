import  HTTP_STATUS  from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { Request,Response } from 'express';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { signupSchema } from '../schemes/signup';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import { authService } from 'src/shared/services/db/auth.service';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';
import { Helpers } from 'src/shared/globals/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from 'src/shared/globals/helpers/cloudinary-upload';

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request,res:Response): Promise<void>
 {
    const { username  ,email , password , avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username,email);
    if(checkIfUserExist) {
        throw new BadRequestError('Invalid credentials.');
    }
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signUpData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    const result: UploadApiResponse = await uploads(avatarImage , `${userObjectId}`, true , true) as UploadApiResponse;

    if(!result.public_id) {
      throw new BadRequestError('File uppload: Error occured.Try again.');
    }

    res.status(HTTP_STATUS.CREATED).json({message: 'User created succesfully' , authData});
 }

  private signUpData(data: ISignUpData): IAuthDocument {
    const {_id , username , email , uId , password , avatarColor} = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUpperCase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;

  }
}
