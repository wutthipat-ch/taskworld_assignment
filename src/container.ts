import { container } from 'tsyringe';
import { Repository, getManager } from 'typeorm';
import ShipRecord from './entities/ShipRecord';
import ShipRepository from './repositories/ShipRepository';
import AttackingLog from './entities/AttackingLog';

export default function (): void {
  container.register<Repository<ShipRecord>>('ShipRepository', { useValue: getManager().getCustomRepository(ShipRepository) });
  container.register<Repository<AttackingLog>>('AttackingLogRepository', { useValue: getManager().getRepository(AttackingLog) });
}
