import * as path from 'path';
import { GraphQLServer } from 'graphql-yoga';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers';
import { createTypeOrmConnection } from './utils/createTypeOrmConnection';

export const startServer = async () => {
  const schema = loadSchemaSync(path.join(__dirname, 'schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
  });

  const schemaWithResolvers = addResolversToSchema({
    schema,
    resolvers,
  });

  const server = new GraphQLServer({ schema: schemaWithResolvers });
  await createTypeOrmConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000,
  });
  console.log('Server is running on localhost:4000');
  return app;
};
