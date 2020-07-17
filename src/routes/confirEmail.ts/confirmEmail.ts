import { Request, Response } from 'express';
import { User } from '../../entity/User';
import { redis } from '../../redis';

export async function confirmEmail(req: Request, res: Response) {
  const { id } = req.params;
  const userId = await redis.get(id);
  if (!userId) {
    return res.send('invalid');
  }
  User.update({ id: userId }, { confirmed: true });
  await redis.del(id);
  res.send('ok');
}
