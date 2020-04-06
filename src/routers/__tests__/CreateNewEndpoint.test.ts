import { Connection } from 'typeorm';
import HttpStatus from 'http-status-codes';
import request from 'supertest';
import server from '../../server';
import database from '../../database';
import Router from '../Router';
import ShipRecord from '../../entities/ShipRecord';
import testDatabaseOptions from '../../configurations/testdatabase';
import ShipState from '../../models/ShipState';
import Cruiser from '../../models/Cruiser';
import Destroyer from '../../models/Destroyer';
import Position from '../../models/Position';
import AttackingLog from '../../entities/AttackingLog';
import AttackResult from '../../models/AttackResult';
import GameState from '../../models/GameState';

describe('Create new game endpoint should work correctly in', () => {
  let connection: Connection;
  const app = server();
  const createNewGameUri = '/api/newgame';
  beforeAll(async () => {
    connection = await database(testDatabaseOptions);
    Router.route(app);
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
  test('create new game successfully', async (done) => {
    const resp = await request(app).post(createNewGameUri);
    const logRecords = await connection.createQueryBuilder().select().from(AttackingLog, 'al').execute();
    const shipRecords = await connection.createQueryBuilder().select().from(ShipRecord, 'sh').execute();
    expect(resp.status).toBe(HttpStatus.CREATED);
    expect(logRecords).toStrictEqual([]);
    expect(shipRecords).toStrictEqual([]);
    done();
  });
});
