import Ship from '../models/Ship';
import BattleShip from '../models/BattleShip';
import Cruiser from '../models/Cruiser';
import Destroyer from '../models/Destroyer';
import Submarine from '../models/Submarine';

export default class ShipUtil {
  static getSpecificShipByShipTypeStr(shipTypeStr: string): Ship {
    switch (shipTypeStr.toLowerCase()) {
      case 'battleship': return new BattleShip();
      case 'cruiser': return new Cruiser();
      case 'destroyer': return new Destroyer();
      case 'submarine': return new Submarine();
      default: return new BattleShip();
    }
  }

  static getStringByTypeofShip(ship: Ship): string {
    if (ship instanceof BattleShip) return BattleShip.dbString;
    if (ship instanceof Cruiser) return Cruiser.dbString;
    if (ship instanceof Destroyer) return Destroyer.dbString;
    if (ship instanceof Submarine) return Submarine.dbString;
    return Ship.dbString;
  }
}
