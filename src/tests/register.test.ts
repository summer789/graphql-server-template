import { startServer } from '..';
import { request } from 'graphql-request';
import { HOST } from './constants';
import 'cross-fetch/polyfill';
import { User } from '../entity/User';
import { AddressInfo } from 'net';

let getHost = () => '';

const email = 'tom@gmail.com';
const password = 'abcd123';

const mutation = `
  mutation {
    register(email:"${email}",password:"${password}")
  }
`;

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  console.log(port);
  getHost = () => `http://127.0.0.1:${port}`;
});

test('Register user', async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const [user] = users;
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});
