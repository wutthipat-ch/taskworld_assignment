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
import Cruiser from '../../models/Cruiser';
import Position from '../../models/Position';
import AttackingLogRecord from '../../entities/AttackingLogRecord';
import AttackResult from '../../models/AttackResult';
import GameState from '../../models/GameState';
import Ship from '../../models/Ship';
import PlacementAxis from '../../models/PlacementAxis';

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
        .delete().from(AttackingLogRecord)
        .execute();
    });
    test('return miss message', async (done) => {
      const resp = await request(app).post(attackUri).send({ position: { x: 0, y: 0 } });
      const log: AttackingLogRecord[] = await connection.createQueryBuilder().select()
        .from(AttackingLogRecord, 'al')
        .where({ result: AttackResult.MISS, gameState: GameState.PROCESS })
        .execute();
      expect(resp.status).toBe(HttpStatus.CREATED);
      expect(resp.body.message).toBe('MISS');
      expect(log.length).toBe(1);
      done();
    });
  });
  describe('attack hit', () => {
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
    beforeAll(async () => {
      let uuid = '';
      const shipRecords = _.flatMap(
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
        .delete().from(AttackingLogRecord)
        .execute();
    });
    describe('Hit correctly', () => {
      test('hit a ship', async (done) => {
        const resp = await request(app).post(attackUri).send({ position: { x: 0, y: 2 } });
        const log: AttackingLogRecord[] = await connection.createQueryBuilder().select()
          .from(AttackingLogRecord, 'al')
          .where({
            result: AttackResult.HIT,
            gameState: GameState.PROCESS,
            position: new Position(0, 2),
            hitShipType: new Cruiser(),
          })
          .execute();
        expect(resp.status).toBe(HttpStatus.CREATED);
        expect(resp.body.message).toBe('HIT');
        expect(log.length).toBe(1);
        done();
      });
      test('sink a type of ship', async (done) => {
        await request(app).post(attackUri).send({ position: { x: 1, y: 2 } });
        const resp = await request(app).post(attackUri).send({ position: { x: 2, y: 2 } });
        const log1: AttackingLogRecord[] = await connection.createQueryBuilder().select()
          .from(AttackingLogRecord, 'al')
          .where({
            result: AttackResult.HIT,
            gameState: GameState.PROCESS,
            position: new Position(1, 2),
            hitShipType: new Cruiser(),
          })
          .execute();
        const log2: AttackingLogRecord[] = await connection.createQueryBuilder().select()
          .from(AttackingLogRecord, 'al')
          .where({
            result: AttackResult.HIT,
            gameState: GameState.PROCESS,
            position: new Position(2, 2),
            hitShipType: new Cruiser(),
          })
          .execute();
        expect(resp.status).toBe(HttpStatus.CREATED);
        expect(resp.body.message).toBe('You just sank a cruiser');
        expect(log1.length).toBe(1);
        expect(log2.length).toBe(1);
        done();
      });
      test('sink all ships win', async (done) => {
        await request(app).post(attackUri).send({ position: { x: 0, y: 4 } });
        await request(app).post(attackUri).send({ position: { x: 1, y: 4 } });
        const resp = await request(app).post(attackUri).send({ position: { x: 2, y: 4 } });
        const log: AttackingLogRecord[] = await connection.createQueryBuilder().select()
          .from(AttackingLogRecord, 'al')
          .where({ result: AttackResult.HIT, gameState: GameState.WIN })
          .execute();
        expect(resp.status).toBe(HttpStatus.CREATED);
        expect(resp.body.message).toBe('Win! You have completed the game in 6 moves');
        expect(log.length).toBe(1);
        done();
      });
    });
  });
});
