import { container } from 'tsyringe';
import express, { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import GameService from './services/GameService';
import * as Validator from './decorators/validator';
import ShipPlacementSchema from './schemas/shipPlacementSchema';

export default class Router {
  static route(app: express.Express): void {
    const gameService = container.resolve(GameService);
    // ship placement endpoint
    app.post('/api/ships', (req, res) => Router.shipPlacementHandler(req, res, gameService));
  }

  @Validator.validateRequestBody(ShipPlacementSchema)
  static async shipPlacementHandler(
    req: Request, res: Response, gameService: GameService,
  ): Promise<void> {
    const generatedId = await gameService.placeShip(req);
    if (generatedId > 0) res.status(HttpStatus.CREATED).send({ id: generatedId });
    else if (generatedId === -1) res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errorMsg: 'The number of ship is already full' });
    else res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errorMsg: 'The position of ship is already exist' });
  }
}
