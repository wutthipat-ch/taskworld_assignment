import { container } from 'tsyringe';
import { Repository, getManager } from 'typeorm';
import ShipRecord from './entities/ShipRecord';
import ShipRepository from './repositories/ShipRepository';

export default function (): void {
  container.register<Repository<ShipRecord>>('ShipRepository', { useValue: getManager().getCustomRepository(ShipRepository) });
}
