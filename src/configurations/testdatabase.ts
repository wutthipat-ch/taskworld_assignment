import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const testDatabaseOptions: ConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'test',
  synchronize: false,
  logging: false,
  entities: [
    'src/entities/**/*.ts',
  ],
};

export default testDatabaseOptions;
