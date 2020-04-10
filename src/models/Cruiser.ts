import Ship from './Ship';

export default class Cruiser extends Ship {
  // eslint-disable-next-line class-methods-use-this
  getNumShip(): number {
    return 2;
  }

  // eslint-disable-next-line class-methods-use-this
  getString(): string {
    return 'cruiser';
  }

  // eslint-disable-next-line class-methods-use-this
  getShipSize(): number {
    return 3;
  }
}
