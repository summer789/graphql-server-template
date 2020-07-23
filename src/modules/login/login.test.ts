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
    login(email, '111111', { login: [invalidLogin] });
  });

  test('email not confirmed', async () => {
    await request(process.env.TEST_HOST, registerMutation(email, '111111'));
    await login(email, '111111', { login: [confirmEmailError] });
    await User.update({ email }, { confirmed: true });
    await login(email, '2222', { login: [invalidLogin] });
    await login(email, '111111', { login: null });
  });
});
