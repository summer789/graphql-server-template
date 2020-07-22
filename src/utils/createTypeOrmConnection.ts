import { getConnectionOptions, createConnection } from 'typeorm';

export async function createTypeOrmConnection(dropSchema: boolean = true) {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({
    ...connectionOptions,
    name: 'default',
    dropSchema,
  });
}
