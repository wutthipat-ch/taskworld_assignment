import { Connection } from 'typeorm';
import HttpStatus from 'http-status-codes';
import request from 'supertest';
import server from '../server';
import database from '../database';
import Router from '../Router';
import ShipRecord from '../entities/ShipRecord';
import testDatabaseOptions from '../configurations/testdatabase';
import ShipState from '../models/ShipState';
import Cruiser from '../models/Cruiser';
import Destroyer from '../models/Destroyer';
import Position from '../models/Position';
import AttackingLog from '../entities/AttackingLog';
import AttackResult from '../models/AttackResult';
import GameState from '../models/GameState';

describe('Get status endpoint should work correctly in', () => {
  let connection: Connection;
  const app = server();
  const getStatusUri = '/api/status';
  beforeAll(async () => {
    connection = await database(testDatabaseOptions);
    Router.route(app);
  });
  test('no log in database', async (done) => {
    const resp = await request(app).get(getStatusUri);
    expect(resp.status).toBe(HttpStatus.OK);
    expect(resp.body.ships).toStrictEqual([]);
    expect(resp.body.game_status).toBe('PROCESS');
    done();
  });
  describe('has log on process', () => {
    const shipRecords = [
      { type: new Cruiser(), state: ShipState.FLOAT, position: new Position(1, 5) },
      { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(2, 6) },
      { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(3, 2) },
    ];
    const logRecords = [
      { position: new Position(0, 0), result: AttackResult.MISS, gameState: GameState.PROCESS },
      { position: new Position(0, 3), result: AttackResult.MISS, gameState: GameState.PROCESS },
      { position: new Position(0, 4), result: AttackResult.MISS, gameState: GameState.PROCESS },
    ];
    beforeAll(async () => {
      await connection.createQueryBuilder()
        .insert()
        .into(ShipRecord)
        .values(shipRecords)
        .execute();
      await connection.createQueryBuilder()
        .insert()
        .into(AttackingLog)
        .values(logRecords)
        .execute();
    });
    afterAll(async () => {
      await connection.createQueryBuilder()
        .delete().from(ShipRecord)
        .execute();
      await connection.createQueryBuilder()
        .delete().from(AttackingLog)
        .execute();
    });
    test('get process with three ships', async (done) => {
      const resp = await request(app).get(getStatusUri);
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.ships).toStrictEqual([
        { type: 'cruiser', state: ShipState.FLOAT, position: { x: 1, y: 5 } },
        { type: 'destroyer', state: ShipState.FLOAT, position: { x: 2, y: 6 } },
        { type: 'destroyer', state: ShipState.FLOAT, position: { x: 3, y: 2 } },
      ]);
      expect(resp.body.game_status).toBe('PROCESS');
      done();
    });
    test('get win with three ships', async (done) => {
      // insert more log
      const shipRecord = {
        position: new Position(0, 4),
        result: AttackResult.MISS,
        gameState: GameState.WIN,
      };
      await connection.createQueryBuilder()
        .insert()
        .into(AttackingLog)
        .values(shipRecord)
        .execute();
      await connection.createQueryBuilder()
        .delete().from(ShipRecord)
        .execute();
      const resp = await request(app).get(getStatusUri);
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.ships).toStrictEqual([]);
      expect(resp.body.game_status).toBe('WIN');
      done();
    });
  });
});
