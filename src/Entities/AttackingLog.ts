import {
  Entity, PrimaryGeneratedColumn, Column, ValueTransformer,
} from 'typeorm';
import AttackResult from '../models/AttackResult';
import Position from '../models/Position';
import GameState from '../models/GameState';

const positionTransformer: ValueTransformer = {
  from: (dbValue: string) => Position.fromDBString(dbValue),
  to: (entityValue: Position) => entityValue.toDBString(),
};

@Entity('attacking_logs')
export default class AttackingLog {
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
}
