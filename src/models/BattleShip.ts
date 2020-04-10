import Ship from './Ship';

export default class BattleShip extends Ship {
  // eslint-disable-next-line class-methods-use-this
  getNumShip(): number {
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this
  getString(): string {
    return 'battleship';
  }

  // eslint-disable-next-line class-methods-use-this
  getShipSize(): number {
    return 4;
  }
}
