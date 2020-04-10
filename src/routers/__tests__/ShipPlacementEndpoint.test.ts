/* eslint-disable arrow-body-style */
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid';
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
import PlacementAxis from '../../models/PlacementAxis';
import Ship from '../../models/Ship';

describe('Ship placment endpoint should work correctly in', () => {
  function generateAllShipPosition(
    headPosition: Position,
    placementAxis: PlacementAxis,
    ship: Ship,
  ): Position[] {
    const positions: Position[] = [];
    for (let i = 0; i < ship.getShipSize(); i += 1) {
      if (placementAxis === PlacementAxis.X) {
        positions.push(new Position(headPosition.getX() + i, headPosition.getY()));
      } else positions.push(new Position(headPosition.getX(), headPosition.getY() + i));
    }
    return positions;
  }
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
      const resp = await request(app).post(shipPlacementUri).send({ type: 'SomeShip', position: { x: 0, y: 0 }, axis: 'x' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
    test('invalid position', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Cruiser', position: { x: 10, y: 0 }, axis: 'x' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      done();
    });
  });
  describe('The number of ship is already full', () => {
    beforeAll(async () => {
      let uuid = '';
      const battleShips = generateAllShipPosition(
        new Position(0, 0),
        PlacementAxis.X,
        new BattleShip(),
      )
        .map((position, index) => {
          uuid = index % 4 === 0 ? uuidv1() : uuid;
          return {
            type: new BattleShip(),
            state: ShipState.FLOAT,
            positionX: position.getX(),
            positionY: position.getY(),
            axis: PlacementAxis.X,
            positionState: position.getState(),
            shipId: uuid,
          };
        });
      const cruisers = _.flatMap(
        [
          new Position(0, 2),
          new Position(0, 4),
        ], (position) => generateAllShipPosition(
          position,
          PlacementAxis.X,
          new Cruiser(),
        ),
      )
        .map((position, index) => {
          uuid = index % 3 === 0 ? uuidv1() : uuid;
          return {
            type: new Cruiser(),
            state: ShipState.FLOAT,
            positionX: position.getX(),
            positionY: position.getY(),
            axis: PlacementAxis.X,
            positionState: position.getState(),
            shipId: uuid,
          };
        });
      const destroyers = _.flatMap(
        [
          new Position(0, 6),
          new Position(0, 8),
          new Position(5, 0),
        ], (position) => generateAllShipPosition(
          position,
          PlacementAxis.X,
          new Destroyer(),
        ),
      )
        .map((position, index) => {
          uuid = index % 2 === 0 ? uuidv1() : uuid;
          return {
            type: new Destroyer(),
            state: ShipState.FLOAT,
            positionX: position.getX(),
            positionY: position.getY(),
            axis: PlacementAxis.X,
            positionState: position.getState(),
            shipId: uuid,
          };
        });
      const submarines = _.flatMap(
        [
          new Position(5, 2),
          new Position(5, 4),
          new Position(5, 6),
          new Position(5, 8),
        ], (position) => generateAllShipPosition(
          position,
          PlacementAxis.X,
          new Submarine(),
        ),
      )
        .map((position, index) => {
          uuid = index % 3 === 0 ? uuidv1() : uuid;
          return {
            type: new Submarine(),
            state: ShipState.FLOAT,
            positionX: position.getX(),
            positionY: position.getY(),
            axis: PlacementAxis.X,
            positionState: position.getState(),
            shipId: uuid,
          };
        });
      const shipRecords = _.concat(battleShips, cruisers, destroyers, submarines);
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
      const resp = await request(app).post(shipPlacementUri).send({ type: 'BattleShip', position: { x: 9, y: 0 }, axis: 'y' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(resp.body).toStrictEqual({ errorMsg: 'The number of ship is already full' });
      done();
    });
    test('Cruiser', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Cruiser', position: { x: 9, y: 0 }, axis: 'y' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(resp.body).toStrictEqual({ errorMsg: 'The number of ship is already full' });
      done();
    });
    test('Destroyer', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Destroyer', position: { x: 9, y: 0 }, axis: 'y' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(resp.body).toStrictEqual({ errorMsg: 'The number of ship is already full' });
      done();
    });
    test('Submarine', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Submarine', position: { x: 9, y: 0 }, axis: 'y' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(resp.body).toStrictEqual({ errorMsg: 'The number of ship is already full' });
      done();
    });
  });
  describe('ship position already exist or consecutive', () => {
    beforeAll(async () => {
      const shipRecords = generateAllShipPosition(
        new Position(0, 0),
        PlacementAxis.X,
        new BattleShip(),
      )
        .map((position) => {
          return {
            type: new BattleShip(),
            state: ShipState.FLOAT,
            positionX: position.getX(),
            positionY: position.getY(),
            axis: PlacementAxis.X,
            positionState: position.getState(),
            shipId: uuidv1(),
          };
        });
      await connection.createQueryBuilder()
        .insert().into(ShipRecord).values(shipRecords)
        .execute();
    });
    afterAll(async () => {
      await connection.createQueryBuilder()
        .delete().from(ShipRecord)
        .execute();
    });
    test('cannot created existed', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Submarine', position: { x: 1, y: 0 }, axis: 'x' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(resp.body).toStrictEqual({ errorMsg: 'The position of ship is already exist, consecutive square with other ships or out of board' });
      done();
    });
    it('cannot created consecutive x', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Submarine', position: { x: 4, y: 0 }, axis: 'x' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(resp.body).toStrictEqual({ errorMsg: 'The position of ship is already exist, consecutive square with other ships or out of board' });
      done();
    });
    it('cannot created consecutive y', async (done) => {
      const resp = await request(app).post(shipPlacementUri).send({ type: 'Submarine', position: { x: 0, y: 1 }, axis: 'x' });
      expect(resp.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(resp.body).toStrictEqual({ errorMsg: 'The position of ship is already exist, consecutive square with other ships or out of board' });
      done();
    });
  });
});
