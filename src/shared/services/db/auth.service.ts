import { IAuthDocument } from './../../../features/auth/interfaces/auth.interface';
import { AuthModel } from 'src/features/auth/models/auth.schema';
import { Helpers } from 'src/shared/globals/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async updatePasswordToken(authId: string,token: string,tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne({_id: authId},{
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    });
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUpperCase(username) }, { email: Helpers.lowerCase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ username: Helpers.firstLetterUpperCase(username) }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt : Date.now() } //ako je passwordResetExpires > Date.now() onda je dobro ali ako nije vratice null
  }).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
