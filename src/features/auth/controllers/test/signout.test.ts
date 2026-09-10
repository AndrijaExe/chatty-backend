import { Request, Response } from 'express';
import { authMockRequest, authMockResponse } from 'src/mocks/auth.mock';
import { testCredentials } from 'src/mocks/test-credentials.mock';
import { SignOut } from '../signout';

const USERNAME = testCredentials.username;
const PASSWORD = testCredentials.password;

describe('SignOut', () => {
  it('should set session to null', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    await SignOut.prototype.update(req, res);
    expect(req.session).toBeNull();
  });

  it('should send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    await SignOut.prototype.update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logout successful',
      user: {},
      token: ''
    });
  });
});
