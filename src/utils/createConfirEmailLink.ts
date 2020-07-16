import { v4 as uuid } from 'uuid';
import { Redis } from 'ioredis';

export async function createConfirmEmailLink(
  url: string,
  userId: string,
  redis: Redis,
) {
  const id = uuid();
  await redis.set(id, userId, 'ex', 60 * 60 * 24);
  return `${url}/confirm/${id}`;
}
