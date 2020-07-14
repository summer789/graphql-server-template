import { startServer } from '../../startServer';
import { request } from 'graphql-request';
import 'cross-fetch/polyfill';
import { User } from '../../entity/User';
import { AddressInfo } from 'net';
import {
  emailAlready,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from './errorMessage';

let getHost = () => '';

const email = 'tom@a.com';
const password = 'abcdefd';

const mutation = (e: string, p: string) => `
mutation {
  register(email:"${e}", password:"${p}") {
    path
    message
  }
}
`;

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

test('Register user', async () => {
  /** 注册成功 */
  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const [user] = users;
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  /** 邮箱已经存在 */
  const response2 = await request(getHost(), mutation(email, password));
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0]).toEqual({
    path: 'email',
    message: emailAlready,
  });

  /** 错误邮箱 */
  const response3 = await request(getHost(), mutation('b', password));
  expect(response3).toEqual({
    register: [
      {
        path: 'email',
        message: emailNotLongEnough,
      },
      {
        path: 'email',
        message: invalidEmail,
      },
    ],
  });

  /** 错误密码 */
  const response4 = await request(getHost(), mutation(email, 'ab'));
  expect(response4).toEqual({
    register: [
      {
        path: 'password',
        message: passwordNotLongEnough,
      },
    ],
  });

  /** 错误密码 and 错误邮箱 */
  const response5 = await request(getHost(), mutation('b', 'ab'));
  expect(response5).toEqual({
    register: [
      {
        path: 'email',
        message: emailNotLongEnough,
      },
      {
        path: 'email',
        message: invalidEmail,
      },
      {
        path: 'password',
        message: passwordNotLongEnough,
      },
    ],
  });
});
