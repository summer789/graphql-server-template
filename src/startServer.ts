import 'dotenv/config';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { GraphQLServer } from 'graphql-yoga';
import { redis } from './redis';
import { genSchema } from './utils/genSchema';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';
import { confirmEmail } from './routes/confirEmail.ts/confirmEmail';
import { AddressInfo } from 'net';

const SESSION_SECRET = 'abcdefg';
const RedisStore = connectRedis(session);
export const startServer = async () => {
  const server = new GraphQLServer({
    context: ({ request }) => ({
      redis,
      req: request,
      url: `${request.protocol}://${request.get('host')}`,
    }),
    schema: genSchema(),
  });

  server.express.use(
    session({
      name: 'sessionId',
      store: new RedisStore({ client: redis }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  server.express.get('/confirm/:id', confirmEmail);

  await createTypeOrmConnection();
  const app = await server.start({
    cors: {
      credentials: true,
      origin: 'localhost:3000',
    },
    port: process.env.NODE_ENV === 'test' ? 0 : 4000,
  });
  console.log(
    `Server is running on localhost:${(app.address() as AddressInfo).port}`,
  );
  return app;
};
