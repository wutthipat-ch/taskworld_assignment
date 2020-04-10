import {
  EntityRepository,
  Repository,
  InsertResult,
  UpdateResult,
} from 'typeorm';
import ShipRecord from '../entities/ShipRecord';
import Position from '../models/Position';
import Ship from '../models/Ship';
import ShipPositionState from '../models/ShipPositionState';
import ShipState from '../models/ShipState';

@EntityRepository(ShipRecord)
export default class ShipRepository extends Repository<ShipRecord> {
  insertShip(shipRecords: ShipRecord[]): Promise<InsertResult> {
    return this.insert(shipRecords);
  }

  countByShipType(shipType: Ship): Promise<number> {
    return this.count({ type: shipType });
  }

  findOneByPosition(positionX: number, positionY: number): Promise<ShipRecord | undefined> {
    return this.findOne({ positionX, positionY });
  }

  countByShipPositionIn(positions: Position[]): Promise<number> {
    return this.count({ where: ShipRepository.generatePositionQueryOption(positions) });
  }

  updatePositionState(
    positionX: number,
    positionY: number,
    positionState: ShipPositionState,
  ): Promise<UpdateResult> {
    return this.update({ positionX, positionY }, { positionState });
  }

  countByPositionStateAndShipId(positionState: ShipPositionState, shipId: string): Promise<number> {
    return this.count({ positionState, shipId });
  }

  updateDateShipStateByShipId(state: ShipState, shipId: string): Promise<UpdateResult> {
    return this.update({ shipId }, { state });
  }

  countByShipState(state: ShipState): Promise<number> {
    return this.count({ state });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static generatePositionQueryOption(positions: Position[]): any {
    return positions.map((position) => ({
      positionX: position.getX(),
      positionY: position.getY(),
    }));
  }
}
