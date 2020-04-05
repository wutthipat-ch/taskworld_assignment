import { EntityRepository, Repository } from 'typeorm';
import ShipRecord from '../entities/ShipRecord';

@EntityRepository(ShipRecord)
export default class ShipRepository extends Repository<ShipRecord> {

}
