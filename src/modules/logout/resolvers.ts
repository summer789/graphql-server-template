import { IResolvers } from 'graphql-tools';
import { Request } from 'express';

export const resolvers: IResolvers<any, { req: Request }> = {
  Mutation: {
    logout: (_, __, { req }) =>
      new Promise((resolve) => {
        req.session.destroy((err) => {
          if (err) {
            console.log(err);
            return resolve(false);
          }
          return resolve(true);
        });
      }),
  },
};
