import Ship from './Ship';

export default class Submarine extends Ship {
  // eslint-disable-next-line class-methods-use-this
  getNumShip(): number {
    return 4;
  }

  // eslint-disable-next-line class-methods-use-this
  getString(): string {
    return 'submarine';
  }

  // eslint-disable-next-line class-methods-use-this
  getShipSize(): number {
    return 3;
  }
}
