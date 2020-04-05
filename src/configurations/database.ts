import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const options: ConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [
    'src/entities/**/*.ts',
  ],
};

export default options;
