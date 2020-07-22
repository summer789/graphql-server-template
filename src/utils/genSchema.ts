import * as path from 'path';
import * as fs from 'fs';
import { loadSchemaSync } from '@graphql-tools/load';
import { mergeSchemas } from '@graphql-tools/merge';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';

export function genSchema() {
  const folders = fs.readdirSync(path.join(__dirname, '../modules'));
  const schemas = folders.map((folder: string) => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const schema = loadSchemaSync(
      path.join(__dirname, `../modules/${folder}/schema.graphql`),
      {
        loaders: [new GraphQLFileLoader()],
      },
    );
    return addResolversToSchema({ resolvers, schema });
  });

  return mergeSchemas({ schemas });
}
