import { EntityRepository, Repository, InsertResult } from 'typeorm';
import ShipRecord from '../entities/ShipRecord';

@EntityRepository(ShipRecord)
export default class ShipRepository extends Repository<ShipRecord> {
  insertShip(shipRecord: ShipRecord): Promise<InsertResult> {
    return this.insert(shipRecord);
  }

  countByShipType(shipRecord: ShipRecord): Promise<number> {
    return this.count({ type: shipRecord.type });
  }
}
