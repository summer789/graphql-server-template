import 'cross-fetch/polyfill';
import { request } from 'graphql-request';
import { invalidLogin } from './errorMessage';
import { createTypeOrmConnection } from '../../utils/createTypeOrmConnection';

// const registerMutation = (e: string, p: string) => `
// mutation {
//   register(email:"${e}", password:"${p}") {
//     path
//     message
//   }
// }
// `;

const loginMutation = (e: string, p: string) => `
mutation {
  login(email:"${e}", password:"${p}") {
    path
    message
  }
}
`;

// beforeAll(async () => {
//   await createTypeOrmConnection();
// });

describe('login', () => {
  test('test', () => {
    expect('112').toEqual('112');
  });
  test('email not found', async () => {
    const response = await request(
      process.env.TEST_HOST,
      loginMutation('abc@abc.com', '111111'),
    );
    expect(response).toEqual({
      login: [invalidLogin],
    });
  });
});
