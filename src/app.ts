import 'reflect-metadata';
import { inject, injectable, container } from 'tsyringe';
import server from './server';
import GameService from './services/GameService';
import databaseOptions from './configurations/database';
import database from './database';

class Application {
  private app = server();

  async startServer(): Promise<void> {
    await database(databaseOptions);
    const gameService = container.resolve(GameService);
    // ship placement endpoint
    this.app.post('/api/ship', (req, res) => {
    });
    // eslint-disable-next-line no-console
    this.app.listen(3000, () => console.log('Starting ExpressJS server on Port 3000'));
  }
}

const application = new Application();
application.startServer();
