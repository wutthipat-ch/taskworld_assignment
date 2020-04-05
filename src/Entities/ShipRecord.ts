import {
  Entity, PrimaryGeneratedColumn, Column, ValueTransformer,
} from 'typeorm';
import BattleShip from '../models/BattleShip';
import Cruiser from '../models/Cruiser';
import Destroyer from '../models/Destroyer';
import Submarine from '../models/Submarine';
import Ship from '../models/Ship';
import ShipState from '../models/ShipState';
import Position from '../models/Position';

const shipTypeTransformer: ValueTransformer = {
  from: (dbValue: string) => {
    switch (dbValue.toLowerCase()) {
      case 'battleship': return new BattleShip();
      case 'cruiser': return new Cruiser();
      case 'destroyer': return new Destroyer();
      case 'submarine': return new Submarine();
      default: return null;
    }
  },
  to: (entityValue: Ship) => {
    if (entityValue instanceof BattleShip) return BattleShip.dbString;
    if (entityValue instanceof Cruiser) return Cruiser.dbString;
    if (entityValue instanceof Destroyer) return Destroyer.dbString;
    if (entityValue instanceof Submarine) return Submarine.dbString;
    return Ship.dbString;
  },
};

const positionTransformer: ValueTransformer = {
  from: (dbValue: string) => Position.fromDBString(dbValue),
  to: (entityValue: Position) => entityValue.toDBString(),
};

@Entity('ships')
export default class ShipRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: '20', transformer: shipTypeTransformer })
  ship !: Ship;

  @Column({ type: 'enum', enum: ShipState, default: ShipState.FLOAT })
  state!: ShipState;

  @Column({ type: 'varchar', length: '20', transformer: positionTransformer })
  position!: Position;
}
