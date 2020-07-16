import { request } from 'graphql-request';
import 'cross-fetch/polyfill';
import { User } from '../../entity/User';
import {
  emailAlready,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from './errorMessage';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';

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
  await createTypeOrmConnection();
});

describe('Register user', () => {
  it('register success', async () => {
    /** 注册成功 */
    const response = await request(
      process.env.TEST_HOST,
      mutation(email, password),
    );
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const [user] = users;
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it('email already', async () => {
    /** 邮箱已经存在 */
    const response2 = await request(
      process.env.TEST_HOST,
      mutation(email, password),
    );
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
      path: 'email',
      message: emailAlready,
    });
  });

  it('check bad email', async () => {
    /** 错误邮箱 */
    const response3 = await request(
      process.env.TEST_HOST,
      mutation('b', password),
    );
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
  });

  it('check bad password', async () => {
    /** 错误密码 */
    const response4 = await request(
      process.env.TEST_HOST,
      mutation(email, 'ab'),
    );
    expect(response4).toEqual({
      register: [
        {
          path: 'password',
          message: passwordNotLongEnough,
        },
      ],
    });
  });

  it('check bad password and email', async () => {
    /** 错误密码 and 错误邮箱 */
    const response5 = await request(process.env.TEST_HOST, mutation('b', 'ab'));
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
});
