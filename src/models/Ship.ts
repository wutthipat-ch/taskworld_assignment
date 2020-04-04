import ShipState from './ShipState';
import Position from './Position';

export default abstract class Ship {
  protected position: Position;

  protected state: ShipState;

  constructor(position: Position) {
    this.position = position;
    this.state = ShipState.FLOAT;
  }

  setPosition(position: Position): void {
    this.position = position;
  }

  setState(state: ShipState): void {
    this.state = state;
  }
}
