import 'cross-fetch/polyfill';
import { request } from 'graphql-request';
import { invalidLogin, confirmEmailError } from './errorMessage';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';
import { User } from '../../entity/User';
import { Connection } from 'typeorm';

const registerMutation = (e: string, p: string) => `
mutation {
  register(email:"${e}", password:"${p}") {
    path
    message
  }
}
`;

const loginMutation = (e: string, p: string) => `
mutation {
  login(email:"${e}", password:"${p}") {
    path
    message
  }
}
`;

const email = 'abc111@abc111.com';
const password = '111111';

async function login(e: string, p: string, expectMessage: any) {
  const response = await request(process.env.TEST_HOST, loginMutation(e, p));
  expect(response).toEqual(expectMessage);
}

let connection: Connection;

beforeAll(async () => {
  connection = await createTypeOrmConnection(false);
});

afterAll(() => connection.close);

describe('login', () => {
  test('email not found', async () => {
    login(email, password, { login: [invalidLogin] });
  });

  test('email not confirmed', async () => {
    await request(process.env.TEST_HOST, registerMutation(email, password));
    await login(email, password, { login: [confirmEmailError] });
    await User.update({ email }, { confirmed: true });
    await login(email, '2222', { login: [invalidLogin] });
    await login(email, password, { login: null });
  });
});
