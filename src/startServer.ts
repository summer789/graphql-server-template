import * as path from 'path';
import * as fs from 'fs';
import { GraphQLServer } from 'graphql-yoga';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { mergeSchemas } from '@graphql-tools/merge';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';

export const startServer = async () => {
  const folders = fs.readdirSync(path.join(__dirname, './modules'));
  const schemas = folders.map((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const schema = loadSchemaSync(
      path.join(__dirname, `./modules/${folder}/schema.graphql`),
      {
        loaders: [new GraphQLFileLoader()],
      },
    );
    return addResolversToSchema({ resolvers, schema });
  });

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
  });

  await createTypeOrmConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000,
  });
  console.log('Server is running on localhost:4000');
  return app;
};
