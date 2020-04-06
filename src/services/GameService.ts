import { Request } from 'express';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import ShipRecord from '../entities/ShipRecord';
import Position from '../models/Position';
import ShipRepository from '../repositories/ShipRepository';
import ShipUtil from '../utils/ShipUtil';
import Cruiser from '../models/Cruiser';
import BattleShip from '../models/BattleShip';
import Destroyer from '../models/Destroyer';
import Submarine from '../models/Submarine';
import AttackingLogRecord from '../entities/AttackingLogRecord';
import AttackResult from '../models/AttackResult';
import AttackResponse from '../models/AttackResponse';
import GameState from '../models/GameState';
import GameStatusResponse from '../models/GameStatusResponse';

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
    ship.setPosition(new Position(x as number, y as number));
    const shipRecord = ShipRecord.fromShipModel(ship);

    if (!await this.isValidNumberShip(shipRecord)) return -1;
    if (!await this.isValidPosition(shipRecord.position)) return -2;
    return this.shipRepository.insertShip(shipRecord)
      .then((result) => result.identifiers[0].id as number);
  }

  async isValidNumberShip(shipRecord: ShipRecord): Promise<boolean> {
    const numShip = await this.shipRepository.countByShipType(shipRecord);
    const ship = shipRecord.type;
    if (ship instanceof BattleShip) return numShip < 1;
    if (ship instanceof Cruiser) return numShip < 2;
    if (ship instanceof Destroyer) return numShip < 3;
    if (ship instanceof Submarine) return numShip < 4;
    return false;
  }

  async isValidPosition(position: Position): Promise<boolean> {
    const result = await this.shipRepository.find()
      .then((shipArr) => shipArr
        .map((ship) => !ship.position.isEqual(position))
        .reduce((x, y) => x && y, true));
    return result;
  }

  async attack(req: Request): Promise<string> {
    const data = req.body;
    const { x, y } = data.position;
    const position = new Position(x as number, y as number);
    const shipFindResult = await this.shipRepository.findOneByPosition(position);
    const attackResult = shipFindResult ? AttackResult.HIT : AttackResult.MISS;
    if (shipFindResult) {
      await this.shipRepository.remove(shipFindResult);
      if (await this.shipRepository.count() === 0) {
        await this.attackingLogRepo.insert({
          position, result: attackResult, gameState: GameState.WIN,
        });
        const numAttack = await this.attackingLogRepo.count();
        return AttackResponse.WIN.replace('X', numAttack.toString(10));
      }
      // hit but not yet win
      await this.attackingLogRepo.insert({
        position, result: attackResult, gameState: GameState.PROCESS,
      });
      if (await this.shipRepository.countByShipType(shipFindResult) === 0) {
        return AttackResponse.SANK.replace('X', ShipUtil.getStringByTypeofShip(shipFindResult.type));
      }
      return attackResult;
    }
    // miss
    await this.attackingLogRepo.insert({
      position, result: attackResult, gameState: GameState.PROCESS,
    });
    return attackResult;
  }

  async getGameStatus(): Promise<GameStatusResponse> {
    const shipRecords = await this.shipRepository.find();
    const gameStatus = await this.attackingLogRepo.findOne({ order: { id: 'DESC' } }).then((log) => {
      if (log) return log.gameState;
      return GameState.PROCESS;
    });
    return new GameStatusResponse(gameStatus, shipRecords
      .map((shipRecord) => shipRecord.toShipModel())
      .map((ship) => Object.assign(ship, { type: ShipUtil.getStringByTypeofShip(ship) })));
  }

  async createNewGame(): Promise<void> {
    await this.shipRepository.clear();
    await this.attackingLogRepo.clear();
  }
}
