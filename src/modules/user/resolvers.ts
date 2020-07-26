import { IResolvers } from 'graphql-tools';
import { Request } from 'express';
import { User } from '../../entity/User';

export const resolvers: IResolvers<any, { req: Request }> = {
  Query: {
    user: (_, __, { req }) =>
      User.findOne({ where: { id: req.session.userId } }),
  },
};
