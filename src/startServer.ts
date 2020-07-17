import { GraphQLServer } from 'graphql-yoga';
import { redis } from './redis';
import { genSchema } from './utils/genSchema';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';
import { confirmEmail } from './routes/confirEmail.ts/confirmEmail';

export const startServer = async () => {
  const server = new GraphQLServer({
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get('host')}`,
    }),
    schema: genSchema(),
  });

  server.express.get('/confirm/:id', confirmEmail);

  await createTypeOrmConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000,
  });
  console.log('Server is running on localhost:4000');
  return app;
};
