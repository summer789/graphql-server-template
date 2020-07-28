import { User } from '../../entity/User';
import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import request from '../../utils/request';

let connection: Connection;
const email = 'bob5@bob.com';
const password = 'jlkajoioiqwe';

let userId: string;

beforeAll(async () => {
  connection = await createTypeOrmConnection(false);
  const user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();
  userId = user.id;
});

afterAll(async () => {
  connection.close();
});

describe('logout', () => {
  test('test logging out a user', async () => {
    await request.login(email, password);
    const res1 = await request.getUser();
    expect(res1.data.data).toEqual({
      user: {
        id: userId,
        email,
      },
    });
    const res2 = await request.logout();
    expect(res2.data.data.logout).toBeTruthy();
    const res3 = await request.getUser();
    expect(res3.data.data.user).toBeNull();
  });
});
