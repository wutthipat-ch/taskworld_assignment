import GameState from './GameState';
import Ship from './Ship';

export default class GameStatusResposne {
  gameState: GameState;

  ships: Ship[];

  constructor(gameState: GameState, ships: Ship[]) {
    this.gameState = gameState;
    this.ships = ships;
  }
}
