import { container } from 'tsyringe';
import express, { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import GameService from '../services/GameService';
import * as Validator from '../decorators/validator';
import ShipPlacementSchema from '../schemas/shipPlacementSchema';
import AttackSchema from '../schemas/attackSchema';

export default class Router {
  static route(app: express.Express): void {
    const gameService = container.resolve(GameService);
    // ship placement endpoint
    app.post('/api/ships', (req, res) => Router.shipPlacementHandler(req, res, gameService));
    // attack endpoint
    app.post('/api/attack', (req, res) => Router.attackHandler(req, res, gameService));
    // status endpoint
    app.get('/api/status', (_, res) => Router.getGameStatus(res, gameService));
    // new game endpoint
    app.post('/api/newgame', (_, res) => Router.createNewGameHandler(res, gameService));
  }

  @Validator.validateRequestBody(ShipPlacementSchema)
  static async shipPlacementHandler(
    req: Request, res: Response, gameService: GameService,
  ): Promise<void> {
    const generatedId = await gameService.placeShip(req);
    if (generatedId > 0) res.status(HttpStatus.CREATED).send({ message: 'Created' });
    else if (generatedId === -1) res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errorMsg: 'The number of ship is already full' });
    else res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errorMsg: 'The position of ship is already exist, consecutive square with other ships or out of board' });
  }

  @Validator.validateRequestBody(AttackSchema)
  static async attackHandler(req: Request, res: Response, gameService: GameService): Promise<void> {
    res.status(HttpStatus.CREATED).send({ message: await gameService.attack(req) });
  }

  static async getGameStatus(res: Response, gameService: GameService): Promise<void> {
    const gameStatus = await gameService.getGameStatus();
    res.status(HttpStatus.OK).send({ game_status: gameStatus.gameState, ships: gameStatus.ships });
  }

  static async createNewGameHandler(res: Response, gameService: GameService): Promise<void> {
    await gameService.createNewGame();
    res.status(HttpStatus.CREATED).send({ message: 'New game created!' });
  }
}
