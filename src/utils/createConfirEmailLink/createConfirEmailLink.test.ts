import * as Redis from 'ioredis';
import axios from 'axios';
import { createConfirmEmailLink } from './createConfirEmailLink';
import { createTypeOrmConnection } from '../createTypeOrmConnection';
import { User } from '../../entity/User';

let userId: string;
const redis = new Redis();

beforeAll(async () => {
  await createTypeOrmConnection();
  const user = await User.create({
    email: 'yingqin.zyq111@alibaba-inc.com',
    password: 'monian111',
  }).save();
  userId = user.id;
});

it('check confirm email and clear key in redis ', async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST,
    userId,
    redis,
  );
  const response = await axios.get(url);
  const text = response.data;
  expect(text).toEqual('ok');
  const user = await User.findOne({ where: { id: userId } });
  if (user) {
    expect(user.confirmed).toBeTruthy();
    const chunks = url.split('/');
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  }
});
