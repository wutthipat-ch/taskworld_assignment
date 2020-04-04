import ShipState from './ShipState';
import Position from './Position';

export default abstract class Ship {
  protected position: Position;

  protected state: ShipState;

  static dbString = 'ship';

  constructor(position?: Position) {
    this.position = position || new Position(0, 0);
    this.state = ShipState.FLOAT;
  }

  setPosition(position: Position): void {
    this.position = position;
  }

  setState(state: ShipState): void {
    this.state = state;
  }
}
