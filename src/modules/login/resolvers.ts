import { IResolvers } from 'graphql-tools';
import * as bcryptjs from 'bcryptjs';
import { User } from '../../entity/User';
import { invalidLogin, confirmEmailError } from './errorMessage';

export const resolvers: IResolvers = {
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [invalidLogin];
      }

      const valid = await bcryptjs.compare(password, user.password);
      if (!valid) {
        return [invalidLogin];
      }

      if (!user.confirmed) {
        return [confirmEmailError];
      }

      return null;
    },
  },
};
