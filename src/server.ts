import express from 'express';

export default function server(): express.Express {
  const app = express();
  app.use(express.json());

  return app;
}
