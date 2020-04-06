import { Request } from 'express';
import { inject, injectable } from 'tsyringe';
import ShipRecord from '../entities/ShipRecord';
import Position from '../models/Position';
import ShipRepository from '../repositories/ShipRepository';
import ShipUtil from '../utils/ShipUtil';
import Cruiser from '../models/Cruiser';
import BattleShip from '../models/BattleShip';
import Destroyer from '../models/Destroyer';
import Submarine from '../models/Submarine';

@injectable()
export default class GameService {
  private shipRepository: ShipRepository;

  constructor(@inject('ShipRepository') shipRepository: ShipRepository) {
    this.shipRepository = shipRepository;
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
}
