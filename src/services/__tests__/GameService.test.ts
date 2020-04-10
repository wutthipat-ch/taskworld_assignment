import { Repository } from 'typeorm';
import ShipRepository from '../../repositories/ShipRepository';
import GameService from '../GameService';
import BattleShip from '../../models/BattleShip';
import Cruiser from '../../models/Cruiser';
import Destroyer from '../../models/Destroyer';
import Submarine from '../../models/Submarine';
import AttackingLogRecord from '../../entities/AttackingLogRecord';

describe('GameService must evaluate method correctly', () => {
  const shipRepository = new ShipRepository();
  const attackingLogRepo = new Repository<AttackingLogRecord>();
  describe('Method isValidNumberShip', () => {
    test('BattleShip passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(0));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new BattleShip();
      expect(service.isValidNumberShip(ship)).resolves.toBe(true);
    });
    it('BattleShip failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(4));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new BattleShip();
      expect(service.isValidNumberShip(ship)).resolves.toBe(false);
    });
    test('Cruiser passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(3));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new Cruiser();
      expect(service.isValidNumberShip(ship)).resolves.toBe(true);
    });
    it('Cruiser failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(6));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new Cruiser();
      expect(service.isValidNumberShip(ship)).resolves.toBe(false);
    });
    test('Destroyer passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(4));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new Destroyer();
      expect(service.isValidNumberShip(ship)).resolves.toBe(true);
    });
    it('Destroyer failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(6));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new Destroyer();
      expect(service.isValidNumberShip(ship)).resolves.toBe(false);
    });
    test('Submarine passed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(9));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new Submarine();
      expect(service.isValidNumberShip(ship)).resolves.toBe(true);
    });
    it('Submarine failed', () => {
      jest.spyOn(shipRepository, 'countByShipType').mockImplementation(() => Promise.resolve(12));
      const service = new GameService(shipRepository, attackingLogRepo);
      const ship = new Submarine();
      expect(service.isValidNumberShip(ship)).resolves.toBe(false);
    });
  });
});
