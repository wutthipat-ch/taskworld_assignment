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

  getPosition(): Position {
    return this.position;
  }

  setPosition(position: Position): void {
    this.position = position;
  }

  getState(): ShipState {
    return this.state;
  }

  setState(state: ShipState): void {
    this.state = state;
  }
}
