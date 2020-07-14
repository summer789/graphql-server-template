import { getConnectionOptions, createConnection } from 'typeorm';

export async function createTypeOrmConnection() {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({ ...connectionOptions, name: 'default' });
}
