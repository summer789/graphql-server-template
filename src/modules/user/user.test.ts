import { User } from '../../entity/User';
import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import request from '../../utils/request';

let userId: string;
let connection: Connection;

const email = 'abc111@abc111.com';
const password = '111111';

beforeAll(async () => {
  connection = await createTypeOrmConnection(false);
  const user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();
  userId = user.id;
});

afterAll(() => {
  connection.close();
});

describe('user', () => {
  test('return null if no cookie', async () => {
    const res = await request.getUser();
    expect(res.data.data.user).toBeNull();
  });

  test('get current user', async () => {
    await request.login(email, password);
    const res = await request.getUser();
    expect(res.data.data).toEqual({
      user: {
        id: userId,
        email,
      },
    });
  });
});
