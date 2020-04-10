import {
  Entity, PrimaryGeneratedColumn, Column, ValueTransformer,
} from 'typeorm';
import { v1 as uuidv1 } from 'uuid';
import _ from 'lodash';
import Ship from '../models/Ship';
import ShipState from '../models/ShipState';
import ShipUtil from '../utils/ShipUtil';
import PlacementAxis from '../models/PlacementAxis';
import ShipPositionState from '../models/ShipPositionState';
import Position from '../models/Position';

const shipTypeTransformer: ValueTransformer = {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  from: ShipUtil.getSpecificShipByShipTypeStr,
  to: (ship: Ship) => ship.getString(),
};

@Entity('ships')
export default class ShipRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ship_id', type: 'varchar', length: '50' })
  shipId!: string;

  @Column({ type: 'varchar', length: '20', transformer: shipTypeTransformer })
  'type' !: Ship;

  @Column({ type: 'enum', enum: ShipState, default: ShipState.FLOAT })
  state!: ShipState;

  @Column({ name: 'position_x', type: 'int' })
  positionX!: number;

  @Column({ name: 'position_y', type: 'int' })
  positionY!: number;

  @Column({ type: 'enum', enum: PlacementAxis })
  axis!: PlacementAxis;

  @Column({ name: 'position_state', type: 'enum', enum: ShipPositionState })
  positionState!: ShipPositionState;

  static fromShipModel(ship: Ship): ShipRecord[] {
    const shipPositions = ship.getPositions();
    const shipId = uuidv1();
    const shipRecords = shipPositions.map((position) => {
      const shipRecord = new ShipRecord();
      shipRecord.shipId = shipId;
      shipRecord.type = ship;
      shipRecord.state = ShipState.FLOAT;
      shipRecord.positionX = position.getX();
      shipRecord.positionY = position.getY();
      shipRecord.axis = ship.getAxis();
      shipRecord.positionState = position.getState();
      return shipRecord;
    });
    return shipRecords;
  }

  static toShipModel(shipRecords: ShipRecord[]): Ship[] {
    const ships: Ship[] = [];
    const shipRecordMaps = _.groupBy(shipRecords, (shipRecord) => shipRecord.shipId);
    _.forIn(shipRecordMaps, (records) => {
      const headRecord = records[0];
      const ship = headRecord.type;
      ship.setAxis(headRecord.axis);
      ship.setState(headRecord.state);
      ship.setPositions(records.map((record) => new Position(record.positionX,
        record.positionY,
        false,
        record.positionState)));
      ships.push(ship);
    });
    return ships;
  }
}
