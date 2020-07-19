import { IResolvers } from 'graphql-tools';
import * as yup from 'yup';
import * as bcryptjs from 'bcryptjs';
import { User } from '../../entity/User';
import { asyncError } from '../../utils/asyncError';
import { formatYupError } from '../../utils/formatYupError';
import {
  emailAlready,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from './errorMessage';
import { createConfirmEmailLink } from '../../utils/createConfirEmailLink/createConfirEmailLink';
import { Redis } from 'ioredis';
import { sendEmail } from '../../utils/sendEmail';

const schema = yup.object().shape({
  email: yup.string().min(3, emailNotLongEnough).max(255).email(invalidEmail),
  password: yup.string().min(3, passwordNotLongEnough).max(255),
});

export const resolvers: IResolvers<any, { redis: Redis; url: string }> = {
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments,
      { redis, url },
    ) => {
      const [error] = await asyncError<any, yup.ValidationError>(
        schema.validate({ email, password }, { abortEarly: false }),
      );
      if (error) {
        return formatYupError(error);
      }
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ['id'],
      });
      if (userAlreadyExists) {
        return [
          {
            path: 'email',
            message: emailAlready,
          },
        ];
      }
      const hashedPassword = await bcryptjs.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword,
      });
      await user.save();
      const link = await createConfirmEmailLink(url, user.id, redis);
      await sendEmail(email, link);
      return null;
    },
  },
};
