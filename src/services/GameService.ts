import { Request } from 'express';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import _ from 'lodash';
import Ship from '../models/Ship';
import ShipRecord from '../entities/ShipRecord';
import Position from '../models/Position';
import ShipRepository from '../repositories/ShipRepository';
import ShipUtil from '../utils/ShipUtil';
import AttackingLogRecord from '../entities/AttackingLogRecord';
import AttackResult from '../models/AttackResult';
import AttackResponse from '../models/AttackResponse';
import GameState from '../models/GameState';
import GameStatusResponse from '../models/GameStatusResponse';
import PlacementAxis, { getPlacementAxisFromStr } from '../models/PlacementAxis';
import ShipPositionState from '../models/ShipPositionState';
import ShipState from '../models/ShipState';

@injectable()
export default class GameService {
  private shipRepository: ShipRepository;

  private attackingLogRepo: Repository<AttackingLogRecord>;

  constructor(@inject('ShipRepository') shipRepository: ShipRepository, @inject('AttackingLogRepository') attackingLogRepo: Repository<AttackingLogRecord>) {
    this.shipRepository = shipRepository;
    this.attackingLogRepo = attackingLogRepo;
  }

  async placeShip(req: Request): Promise<number> {
    const data = req.body;
    const shipType = data.type as string;
    const { x, y } = data.position;
    const ship = ShipUtil.getSpecificShipByShipTypeStr(shipType);
    const placementAxis = getPlacementAxisFromStr(data.axis as string);
    const headPosition = new Position(x as number, y as number);
    if (!await this.isValidNumberShip(ship)) return -1;
    try {
      const shipPositions = GameService.generateAllShipPosition(headPosition, placementAxis, ship);
      if (!await this.isValidPosition(shipPositions)) return -2;
      ship.setPositions(shipPositions);
      ship.setAxis(placementAxis);
    } catch (error) {
      return -2;
    }
    const shipRecords = ShipRecord.fromShipModel(ship);

    return this.shipRepository.insertShip(shipRecords)
      .then((result) => result.identifiers[0].id as number);
  }

  async isValidNumberShip(ship: Ship): Promise<boolean> {
    const numShip = await this.shipRepository.countByShipType(ship) / ship.getShipSize();
    return numShip < ship.getNumShip();
  }

  async isValidPosition(shipPositions: Position[]): Promise<boolean> {
    const positions = _.uniqBy(_.concat(shipPositions,
      GameService.generateConsequentPosition(shipPositions)),
    // eslint-disable-next-line @typescript-eslint/unbound-method
    Position.uniqPositionFn);
    const count = await this.shipRepository.countByShipPositionIn(positions);
    return count === 0;
  }

  private static generateAllShipPosition(
    headPosition: Position,
    placementAxis: PlacementAxis,
    ship: Ship,
  ): Position[] {
    const positions: Position[] = [];
    for (let i = 0; i < ship.getShipSize(); i += 1) {
      if (placementAxis === PlacementAxis.X) {
        positions.push(new Position(headPosition.getX() + i, headPosition.getY()));
      } else positions.push(new Position(headPosition.getX(), headPosition.getY() + i));
    }
    return positions;
  }

  private static generateConsequentPosition(positions: Position[]): Position[] {
    const allOccupiedPosition = _.flatMap(positions,
      (position) => [new Position(position.getX() - 1, position.getY(), true),
        new Position(position.getX() + 1, position.getY(), true),
        new Position(position.getX(), position.getY() - 1, true),
        new Position(position.getX(), position.getY() + 1, true),
      ]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return _.uniqBy(allOccupiedPosition, Position.uniqPositionFn);
  }

  async attack(req: Request): Promise<string> {
    const data = req.body;
    const { x, y } = data.position;
    const position = new Position(x as number, y as number);
    const shipFindResult = await this.shipRepository.findOneByPosition(x as number, y as number);
    const attackResult = shipFindResult ? AttackResult.HIT : AttackResult.MISS;
    if (shipFindResult) {
      const updatedShipState = await this.updateAttackedShipState(shipFindResult);
      // hit and win
      if (await this.shipRepository.countByShipState(ShipState.FLOAT) === 0) {
        await this.attackingLogRepo.insert({
          position,
          result: attackResult,
          gameState: GameState.WIN,
          hitShipId: shipFindResult.shipId,
          hitShipType: shipFindResult.type,
        });
        const numAttack = await this.attackingLogRepo.count();
        return AttackResponse.WIN.replace('X', numAttack.toString(10));
      }
      // hit but not yet win
      await this.attackingLogRepo.insert({
        position,
        result: attackResult,
        gameState: GameState.PROCESS,
        hitShipId: shipFindResult.shipId,
        hitShipType: shipFindResult.type,
      });
      if (updatedShipState === ShipState.SUNK) {
        return AttackResponse.SANK.replace('X', shipFindResult.type.getString());
      }
      return attackResult;
    }
    // miss
    await this.attackingLogRepo.insert({
      position,
      result: attackResult,
      gameState: GameState.PROCESS,
    });
    return attackResult;
  }

  private async updateAttackedShipState(shipRecord: ShipRecord): Promise<ShipState> {
    await this.shipRepository
      .updatePositionState(
        shipRecord.positionX,
        shipRecord.positionY,
        ShipPositionState.BROKEN,
      );
    const countFinePosition = await this.shipRepository
      .countByPositionStateAndShipId(ShipPositionState.FINE, shipRecord.shipId);
    if (countFinePosition === 0) {
      await this.shipRepository.updateDateShipStateByShipId(ShipState.SUNK, shipRecord.shipId);
      return ShipState.SUNK;
    }
    return ShipState.FLOAT;
  }

  async getGameStatus(): Promise<GameStatusResponse> {
    const shipRecords = await this.shipRepository.find();
    const gameStatus = await this.attackingLogRepo.findOne({ order: { id: 'DESC' } }).then((log) => {
      if (log) return log.gameState;
      return GameState.PROCESS;
    });
    return new GameStatusResponse(gameStatus, ShipRecord.toShipModel(shipRecords)
      .map((ship) => Object.assign(ship, { type: ship.getString() })));
  }

  async createNewGame(): Promise<void> {
    await this.shipRepository.clear();
    await this.attackingLogRepo.clear();
  }
}
