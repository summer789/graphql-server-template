import axios from 'axios';

import { User } from '../../entity/User';
import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';

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

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const meQuery = `
{
  user {
    id
    email
  }
}
`;

describe('user', () => {
  test('return null if no cookie', async () => {
    const response = await axios.post(process.env.TEST_HOST as string, {
      query: meQuery,
    });
    expect(response.data.data.user).toBeNull();
  });

  test('get current user', async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password),
      },
      {
        withCredentials: true,
      },
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      },
    );

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });
  });
});
