import { User } from '../../entity/User';
import {
  emailAlready,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from './errorMessage';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { Connection } from 'typeorm';
import request from '../../utils/request';

const email = 'tom@111a.com';
const password = 'abcdefd';

let connection: Connection;

afterAll(() => connection.close);

beforeAll(async () => {
  connection = await createTypeOrmConnection();
});

describe('Register user', () => {
  it('register success', async () => {
    /** 注册成功 */
    const response = await request.register(email, password);
    expect(response.data.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const [user] = users;
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it('email already', async () => {
    /** 邮箱已经存在 */
    const response2 = await request.register(email, password);
    expect(response2.data.data.register).toHaveLength(1);
    expect(response2.data.data.register[0]).toEqual({
      path: 'email',
      message: emailAlready,
    });
  });

  it('check bad email', async () => {
    /** 错误邮箱 */
    const response3 = await request.register('b', password);
    expect(response3.data.data).toEqual({
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
    const response4 = await request.register(email, 'ab');
    expect(response4.data.data).toEqual({
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
    const response5 = await request.register('b', 'ab');
    expect(response5.data.data).toEqual({
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
