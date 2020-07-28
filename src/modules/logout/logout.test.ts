import axios from 'axios';
import tough from 'tough-cookie';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { User } from '../../entity/User';
import { Connection } from 'typeorm';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

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
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password),
      },
      {
        jar: cookieJar,
        withCredentials: true,
      },
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        jar: cookieJar,
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
        jar: cookieJar,
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
        jar: cookieJar,
        withCredentials: true,
      },
    );

    expect(response2.data.data.user).toBeNull();
  });
});
