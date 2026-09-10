/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { authMock, authMockRequest, authMockResponse } from 'src/mocks/auth.mock';
import { SignIn } from '../signin';
import { CustomError } from 'src/shared/globals/helpers/error-handler';
import { authService } from 'src/shared/services/db/auth.service';
import { Helpers } from 'src/shared/globals/helpers/helpers';
import { userService } from 'src/shared/services/db/user.service';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { testCredentials } from 'src/mocks/test-credentials.mock';

const USERNAME = testCredentials.username;
const PASSWORD = testCredentials.password;
const WRONG_USERNAME = 'da';
const WRONG_PASSWORD = 'da';
const LONG_PASSWORD = 'mathematics11111111';
const LONG_USERNAME = 'mathematics111111111';

jest.useFakeTimers();
jest.mock('src/shared/services/queues/base.queue');

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);

    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUpperCase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials.');
    });
  });

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);

    SignIn.prototype.Read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUpperCase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials.');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(authMock);


    const mergedAuthAndUserData = {
      username: USERNAME,
      password: PASSWORD
      // dodaj ostala polja ako ih tvoj model očekuje
      } as IUserDocument;

    const expectedUser = {
      authId: authMock._id,
      avatarColor: authMock.avatarColor,
      createdAt: authMock.createdAt,
      email: authMock.email,
      password: PASSWORD, // jer si tako mockovao
      uId: authMock.uId,
      username: authMock.username
    };

    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);
    await SignIn.prototype.Read(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: expectedUser,
      token: req.session?.jwt
    });
  });
});
