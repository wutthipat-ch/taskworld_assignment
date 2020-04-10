import ShipState from './ShipState';
import Position from './Position';
import PlacementAxis from './PlacementAxis';

export default abstract class Ship {
  protected positions: Position[];

  protected state: ShipState;

  protected axis!: PlacementAxis;

  constructor(positions?: Position[]) {
    this.positions = positions || [];
    this.state = ShipState.FLOAT;
  }

  abstract getString(): string;

  abstract getShipSize(): number;

  abstract getNumShip(): number;

  getPositions(): Position[] {
    return this.positions;
  }

  setPositions(positions: Position[]): void {
    this.positions = positions;
  }

  getState(): ShipState {
    return this.state;
  }

  setState(state: ShipState): void {
    this.state = state;
  }

  getAxis(): PlacementAxis {
    return this.axis;
  }

  setAxis(axis: PlacementAxis): void {
    this.axis = axis;
  }
}
