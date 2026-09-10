const DEFAULT_TEST_USERNAME = 'testuser';
const DEFAULT_TEST_EMAIL = 'user.fixture@example.com';
const DEFAULT_TEST_PASSWORD = 'dummyP4ss';
const DEFAULT_TEST_JWT = 'test.jwt.token';

export const testCredentials = {
  username: process.env.TEST_AUTH_USERNAME || DEFAULT_TEST_USERNAME,
  email: process.env.TEST_AUTH_EMAIL || DEFAULT_TEST_EMAIL,
  password: process.env.TEST_AUTH_PASSWORD || DEFAULT_TEST_PASSWORD,
  jwt: process.env.TEST_AUTH_JWT || DEFAULT_TEST_JWT
};
