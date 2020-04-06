import 'reflect-metadata';
import server from './server';
import databaseOptions from './configurations/database';
import database from './database';
import Router from './routers/Router';

export default class Application {
  private app = server();

  async startServer(): Promise<void> {
    await database(databaseOptions);

    Router.route(this.app);
    // eslint-disable-next-line no-console
    this.app.listen(3000, () => console.log('Starting ExpressJS server on Port 3000'));
  }
}

const application = new Application();
application.startServer();
