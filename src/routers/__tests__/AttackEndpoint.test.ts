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

describe('Attack endpoint should work correctly in', () => {
  let connection: Connection;
  const app = server();
  const attackUri = '/api/attack';
  beforeAll(async () => {
    connection = await database(testDatabaseOptions);
    Router.route(app);
  });
  describe('invalid request', () => {
    test('invalid position x', async (done) => {
      const resp = await request(app).post(attackUri).send({ position: { x: 10, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
    it('invalid position y', async (done) => {
      const resp = await request(app).post(attackUri).send({ position: { x: 0, y: -1 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
  });
  describe('attack missed', () => {
    afterAll(async () => {
      await connection.createQueryBuilder()
        .delete().from(ShipRecord)
        .execute();
      await connection.createQueryBuilder()
        .delete().from(AttackingLog)
        .execute();
    });
    test('return miss message', async (done) => {
      const resp = await request(app).post(attackUri).send({ position: { x: 0, y: 0 } });
      const log: AttackingLog[] = await connection.createQueryBuilder().select()
        .from(AttackingLog, 'al')
        .where({ result: AttackResult.MISS, gameState: GameState.PROCESS })
        .execute();
      expect(resp.status).toBe(HttpStatus.CREATED);
      expect(resp.body.message).toBe('MISS');
      expect(log.length).toBe(1);
      done();
    });
  });
  describe('attack hit', () => {
    const shipRecords = [
      { type: new Cruiser(), state: ShipState.FLOAT, position: new Position(1, 0) },
      { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(2, 0) },
      { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(3, 0) },
    ];
    beforeAll(async () => {
      await connection.createQueryBuilder()
        .insert()
        .into(ShipRecord)
        .values(shipRecords)
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
    test('sink a ship', async (done) => {
      const resp = await request(app).post(attackUri).send({ position: { x: 2, y: 0 } });
      const log: AttackingLog[] = await connection.createQueryBuilder().select()
        .from(AttackingLog, 'al')
        .where({
          result: AttackResult.HIT,
          gameState: GameState.PROCESS,
          position: new Position(2, 0),
        })
        .execute();
      expect(resp.status).toBe(HttpStatus.CREATED);
      expect(resp.body.message).toBe('HIT');
      expect(log.length).toBe(1);
      done();
    });
    it('sink a type of ship', async (done) => {
      const resp = await request(app).post(attackUri).send({ position: { x: 3, y: 0 } });
      const log: AttackingLog[] = await connection.createQueryBuilder().select()
        .from(AttackingLog, 'al')
        .where({
          result: AttackResult.HIT,
          gameState: GameState.PROCESS,
          position: new Position(3, 0),
        })
        .execute();
      expect(resp.status).toBe(HttpStatus.CREATED);
      expect(resp.body.message).toBe('You just sank a destroyer');
      expect(log.length).toBe(1);
      done();
    });
    it('sink all ships win', async (done) => {
      const resp = await request(app).post(attackUri).send({ position: { x: 1, y: 0 } });
      const log: AttackingLog[] = await connection.createQueryBuilder().select()
        .from(AttackingLog, 'al')
        .where({ result: AttackResult.HIT, gameState: GameState.WIN })
        .execute();
      expect(resp.status).toBe(HttpStatus.CREATED);
      expect(resp.body.message).toBe('Win! You have completed the game in 3 moves');
      expect(log.length).toBe(1);
      done();
    });
  });
});
