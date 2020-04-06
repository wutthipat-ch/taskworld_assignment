import ShipUtil from '../ShipUtil';
import BattleShip from '../../models/BattleShip';
import Cruiser from '../../models/Cruiser';
import Destroyer from '../../models/Destroyer';
import Submarine from '../../models/Submarine';

describe('ShipUtil must return instance of specific ship correctly in getSpecificShipByShipTypeStr', () => {
  test('when ship type string is battleship', () => {
    expect(ShipUtil.getSpecificShipByShipTypeStr('battleship')).toStrictEqual(new BattleShip());
  });
  it('when ship type string is cruiser', () => {
    expect(ShipUtil.getSpecificShipByShipTypeStr('cruiser')).toStrictEqual(new Cruiser());
  });
  it('when ship type string is destroyer', () => {
    expect(ShipUtil.getSpecificShipByShipTypeStr('destroyer')).toStrictEqual(new Destroyer());
  });
  it('when ship type string is submarine', () => {
    expect(ShipUtil.getSpecificShipByShipTypeStr('submarine')).toStrictEqual(new Submarine());
  });
});
