import {
  Entity, PrimaryGeneratedColumn, Column, ValueTransformer,
} from 'typeorm';
import AttackResult from '../models/AttackResult';
import Position from '../models/Position';
import GameState from '../models/GameState';
import Ship from '../models/Ship';
import ShipUtil from '../utils/ShipUtil';

const shipTypeTransformer: ValueTransformer = {
  from: (str: string) => (str ? ShipUtil.getSpecificShipByShipTypeStr(str) : null),
  to: (ship: Ship) => (ship ? ship.getString() : null),
};

const positionTransformer: ValueTransformer = {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  from: Position.fromDBString,
  to: (entityValue: Position) => entityValue.toDBString(),
};

@Entity('attacking_logs')
export default class AttackingLogRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: '20', transformer: positionTransformer })
  position!: Position;

  @Column({ type: 'enum', enum: AttackResult })
  result!: AttackResult;

  @Column({
    name: 'game_state',
    type: 'enum',
    enum: GameState,
    default: GameState.PROCESS,
  })
  gameState!: GameState;

  @Column({ name: 'hit_ship_id', type: 'varchar', length: '50' })
  hitShipId!: string;

  @Column({
    name: 'hit_ship_type',
    type: 'varchar',
    length: '20',
    transformer: shipTypeTransformer,
  })
  hitShipType !: Ship;
}
