import Ship from './Ship';

export default class Destroyer extends Ship {
  // eslint-disable-next-line class-methods-use-this
  getNumShip(): number {
    return 3;
  }

  // eslint-disable-next-line class-methods-use-this
  getString(): string {
    return 'destroyer';
  }

  // eslint-disable-next-line class-methods-use-this
  getShipSize(): number {
    return 2;
  }
}
