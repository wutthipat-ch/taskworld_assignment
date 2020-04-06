import { Connection } from 'typeorm';
import HttpStatus from 'http-status-codes';
import request from 'supertest';
import server from '../../server';
import database from '../../database';
import Router from '../Router';
import ShipRecord from '../../entities/ShipRecord';
import testDatabaseOptions from '../../configurations/testdatabase';
import ShipState from '../../models/ShipState';
import BattleShip from '../../models/BattleShip';
import Cruiser from '../../models/Cruiser';
import Destroyer from '../../models/Destroyer';
import Submarine from '../../models/Submarine';
import Position from '../../models/Position';

describe('Ship placment endpoint should work correctly in', () => {
  let connection: Connection;
  const app = server();
  const shipPlacementUri = '/api/ships';
  beforeAll(async () => {
    connection = await database(testDatabaseOptions);
    Router.route(app);
  });
  describe('request is invalid', () => {
    afterEach(async () => {
      await connection.createQueryBuilder().delete().from(ShipRecord).execute();
    });
    test('invalid type', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'SomeShip', position: { x: 0, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
    test('invalid position', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Cruiser', position: { x: 10, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
    test('valid request', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Cruiser', position: { x: 0, y: 0 } });
      expect(resp.status).toBe(HttpStatus.CREATED);
      done();
    });
  });
  describe('The number of ship is already full', () => {
    beforeAll(async () => {
      const shipRecords = [
        { type: new BattleShip(), state: ShipState.FLOAT, position: new Position(0, 0) },
        { type: new Cruiser(), state: ShipState.FLOAT, position: new Position(1, 0) },
        { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(2, 0) },
        { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(3, 0) },
        { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(4, 0) },
        { type: new Destroyer(), state: ShipState.FLOAT, position: new Position(5, 0) },
        { type: new Submarine(), state: ShipState.FLOAT, position: new Position(6, 0) },
        { type: new Submarine(), state: ShipState.FLOAT, position: new Position(7, 0) },
        { type: new Submarine(), state: ShipState.FLOAT, position: new Position(8, 0) },
        { type: new Submarine(), state: ShipState.FLOAT, position: new Position(9, 0) },
      ];
      await connection.createQueryBuilder()
        .insert().into(ShipRecord).values(shipRecords)
        .execute();
    });
    afterAll(async () => {
      await connection.createQueryBuilder()
        .delete().from(ShipRecord)
        .execute();
    });
    test('BattleShip', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'BattleShip', position: { x: 0, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
    test('Cruiser', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Cruiser', position: { x: 0, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
    test('Destroyer', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Destroyer', position: { x: 0, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
    test('Submarine', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Submarine', position: { x: 0, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
  });
  describe('ship position already exist', () => {
    beforeAll(async () => {
      const shipRecords = [
        { type: new BattleShip(), state: ShipState.FLOAT, position: new Position(0, 0) },
      ];
      await connection.createQueryBuilder()
        .insert().into(ShipRecord).values(shipRecords)
        .execute();
    });
    afterAll(async () => {
      await connection.createQueryBuilder()
        .delete().from(ShipRecord)
        .execute();
    });
    test('cannot created', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Submarine', position: { x: 0, y: 0 } });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
  });
});
