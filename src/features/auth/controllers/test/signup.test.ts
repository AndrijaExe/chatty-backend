import { Request, Response } from 'express';
import { authMock, authMockRequest, authMockResponse } from 'src/mocks/auth.mock';
import * as cloudinaryUploads from 'src/shared/globals/helpers/cloudinary-upload';
import { SignUp } from '../signup';
import { CustomError } from 'src/shared/globals/helpers/error-handler';
import { authService } from 'src/shared/services/db/auth.service';
import { UserCache } from 'src/shared/services/redis/user.cache';
import { testCredentials } from 'src/mocks/test-credentials.mock';

jest.mock('src/shared/services/queues/base.queue');
jest.mock('src/shared/services/redis/user.cache');
jest.mock('src/shared/services/queues/user.queue');
jest.mock('src/shared/services/queues/auth.queue');
jest.mock('src/shared/globals/helpers/cloudinary-upload');

describe('SignUp', () => {
  const VALID_USERNAME = testCredentials.username;
  const VALID_EMAIL = testCredentials.email;
  const VALID_PASSWORD = testCredentials.password;

  //ova dva nam konkretno za nas slucaj ne trebaju ali ako bi pravili integrisane testove sa bazom i/ili redis-om trebalo bi nam vrv
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should throw an error if username is not available.', () => {
    const req:Request = authMockRequest({} , {
      username: '',
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });


  it('Should throw an error if username length is less than minimum.', () => {
    const req:Request = authMockRequest({} , {
      username: 'da',
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('Should throw an error if username length is greater than maximum.', () => {
    const req:Request = authMockRequest({} , {
      username: 'daaaaaaaaaaaaaaaaaaaaaaaa',
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });


  it('Should throw an error if email is invalid.', () => {
    const req:Request = authMockRequest({} , {
      username: VALID_USERNAME,
      email: 'not valid',
      password: VALID_PASSWORD,
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });


  it('Should throw an error if email is not available.', () => {
    const req:Request = authMockRequest({} , {
      username: VALID_USERNAME,
      email: '',
      password: VALID_PASSWORD,
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });


  it('Should throw an error if password length is greater than maximum.', () => {
    const req:Request = authMockRequest({} , {
      username: VALID_USERNAME,
      email: VALID_EMAIL,
      password: 'dummyPasswordTooLong123',
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });


  it('Should throw an error if password is not available.', () => {
    const req:Request = authMockRequest({} , {
      username: VALID_USERNAME,
      email: VALID_EMAIL,
      password: '',
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('Should throw an error if password length is less than minimum.', () => {
    const req:Request = authMockRequest({} , {
      username: VALID_USERNAME,
      email: VALID_EMAIL,
      password: 'qw',
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });


  it('Should throw an error if user already exist.', () => {
    const req:Request = authMockRequest({} , {
      username: VALID_USERNAME,
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      avatarColor: 'red',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock); //mora resolved value jer je promise
    SignUp.prototype.create(req,res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials.');
    });
  });


  it('Should set session data for valid credentials and send correct json response.', async () => {
    const req:Request = authMockRequest({} , {
      username: VALID_USERNAME,
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      avatarColor: 'purple',
      avatarImage: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    }) as Request;
    const res: Response = authMockResponse();


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any); //mora resolved value jer je promise
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '121121243', public_id: '123456'}));

    await SignUp.prototype.create(req,res);
    expect(req.session?.jwt).toBeDefined();

    expect(res.json).toHaveBeenCalledWith({
      message: 'User created succesfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });

  });
});
