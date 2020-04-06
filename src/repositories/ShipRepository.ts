import { EntityRepository, Repository, InsertResult } from 'typeorm';
import ShipRecord from '../entities/ShipRecord';
import Position from '../models/Position';

@EntityRepository(ShipRecord)
export default class ShipRepository extends Repository<ShipRecord> {
  insertShip(shipRecord: ShipRecord): Promise<InsertResult> {
    return this.insert(shipRecord);
  }

  countByShipType(shipRecord: ShipRecord): Promise<number> {
    return this.count({ type: shipRecord.type });
  }

  findOneByPosition(position: Position): Promise<ShipRecord | undefined> {
    return this.findOne({ position });
  }
}
