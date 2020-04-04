import server from './server';

function startServer(): void {
  const app = server();
  if (app) {
    // eslint-disable-next-line no-console
    app.listen(3000, () => console.log('Starting ExpressJS server on Port 3000'));
  }
}

startServer();
