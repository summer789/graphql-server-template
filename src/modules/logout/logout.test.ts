import axios from 'axios';
import { User } from '../../entity/User';
import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';

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

const logoutMutation = `
mutation {
  logout
}
`;

describe('logout', () => {
  test('test logging out a user', async () => {
    const res = await axios.post(
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
      user: {
        id: userId,
        email,
      },
    });

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation,
      },
      {
        withCredentials: true,
      },
    );

    const response2 = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      },
    );

    expect(response2.data.data.user).toBeNull();
  });
});
