import * as fs from 'fs';
import * as path from 'path';
import { generateNamespace } from '@gql2ts/from-schema';
import { genSchema } from '../utils/genSchema';

fs.writeFile(
  path.join(`${__dirname}`, '../types/schema.d.ts'),
  generateNamespace('GQL', genSchema()),
  console.log,
);
