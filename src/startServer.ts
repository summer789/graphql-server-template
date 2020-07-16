import * as path from 'path';
import * as fs from 'fs';
import * as Redis from 'ioredis';
import { GraphQLServer } from 'graphql-yoga';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { mergeSchemas } from '@graphql-tools/merge';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';
import { User } from './entity/User';

export const startServer = async () => {
  const folders = fs.readdirSync(path.join(__dirname, './modules'));
  const schemas = folders.map((folder: string) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const schema = loadSchemaSync(
      path.join(__dirname, `./modules/${folder}/schema.graphql`),
      {
        loaders: [new GraphQLFileLoader()],
      },
    );
    return addResolversToSchema({ resolvers, schema });
  });

  const redis = new Redis();

  const server = new GraphQLServer({
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get('host')}`,
    }),
    schema: mergeSchemas({ schemas }),
  });

  server.express.get('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (!userId) {
      return res.send('invalid');
    }
    User.update({ id: userId }, { confirmed: true });
    res.send('ok');
  });

  await createTypeOrmConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000,
  });
  console.log('Server is running on localhost:4000');
  return app;
};
