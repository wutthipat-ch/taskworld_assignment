import ShipRepository from '../../repositories/ShipRepository';
import GameService from '../GameService';
import ShipRecord from '../../entities/ShipRecord';
import BattleShip from '../../models/BattleShip';
import Cruiser from '../../models/Cruiser';
import Destroyer from '../../models/Destroyer';
import Submarine from '../../models/Submarine';

describe('GameService must evaluate method correctly', () => {
  const shipRepository = new ShipRepository();
  describe('Method isValidNumberShip', () => {
    test('BattleShip passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(0));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new BattleShip();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(true);
    });
    it('BattleShip failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(1));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new BattleShip();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(false);
    });
    test('Cruiser passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(1));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new Cruiser();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(true);
    });
    it('Cruiser failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(2));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new Cruiser();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(false);
    });
    test('Destroyer passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(2));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new Destroyer();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(true);
    });
    it('Destroyer failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(3));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new Destroyer();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(false);
    });
    test('Submarine passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(3));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new Submarine();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(true);
    });
    it('Submarine failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(4));
      const service = new GameService(shipRepository);
      const shipRecord = new ShipRecord();
      shipRecord.type = new Submarine();
      expect(service.isValidNumberShip(shipRecord)).resolves.toBe(false);
    });
  });
});
