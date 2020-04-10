import ShipPositionState from './ShipPositionState';

export default class Position {
  static min = 0;

  static max = 9;

  private x: number;

  private y: number;

  private state: ShipPositionState;

  constructor(x: number, y: number, bypassValidation?: boolean, state?: ShipPositionState) {
    if (!bypassValidation && (!Position.isValidX(x) || !Position.isValidY(y))) {
      Position.throwInvalidCoordinateError();
    }
    this.x = x;
    this.y = y;
    this.state = state || ShipPositionState.FINE;
  }

  static isValidX(x: number): boolean {
    return x >= Position.min && x <= Position.max;
  }

  static isValidY(y: number): boolean {
    return y >= Position.min && y <= Position.max;
  }

  static throwInvalidCoordinateError(): void {
    throw new Error('The coordination value must not be negative and over than 9');
  }

  static uniqPositionFn(position: Position): string {
    return `${position.getX()},${position.getY()}`;
  }

  static fromDBString(dbString: string): Position {
    const arrayString = dbString.trim().split(',');
    const x = arrayString[0];
    const y = arrayString[1];
    return new Position(+x, +y);
  }

  toDBString(): string {
    return `${this.getX()},${this.getY()}`;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  setX(x: number): void {
    if (!Position.isValidX(x)) Position.throwInvalidCoordinateError();
    this.x = x;
  }

  setY(y: number): void {
    if (!Position.isValidY(y)) Position.throwInvalidCoordinateError();
    this.y = y;
  }

  getState(): ShipPositionState {
    return this.state;
  }

  setState(state: ShipPositionState): void {
    this.state = state;
  }

  isEqual(position: Position): boolean {
    return this.x === position.getX() && this.y === position.getY();
  }
}
