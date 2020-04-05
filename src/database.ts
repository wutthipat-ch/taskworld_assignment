import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import registerContainer from './container';

export default async function Database(option: ConnectionOptions): Promise<Connection> {
  try {
    const connection = await createConnection(option);
    registerContainer();
    return connection;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('TypeORM Connection Error: ', error);
    throw (error);
  }
}
