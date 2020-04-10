import { Connection } from 'typeorm';
import _ from 'lodash';
import { v1 as uuidv1 } from 'uuid';
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
import AttackingLogRecord from '../../entities/AttackingLogRecord';
import AttackResult from '../../models/AttackResult';
import GameState from '../../models/GameState';
import PlacementAxis from '../../models/PlacementAxis';
import Ship from '../../models/Ship';

describe('Get status endpoint should work correctly in', () => {
  let connection: Connection;
  const app = server();
  const getStatusUri = '/api/status';
  const attackUri = '/api/attack';
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
    let uuid = '';
    const shipRecords = _.flatMap(
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
        .into(AttackingLogRecord)
        .values(logRecords)
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
    test('get process with three ships', async (done) => {
      const resp = await request(app).get(getStatusUri);
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.ships).toStrictEqual([
        {
          type: 'destroyer',
          state: ShipState.FLOAT,
          axis: 'X',
          positions: [{ x: 0, y: 6, state: 'FINE' }, { x: 1, y: 6, state: 'FINE' }],
        },
        {
          type: 'destroyer',
          state: ShipState.FLOAT,
          axis: 'X',
          positions: [{ x: 0, y: 8, state: 'FINE' }, { x: 1, y: 8, state: 'FINE' }],
        },
        {
          type: 'destroyer',
          state: ShipState.FLOAT,
          axis: 'X',
          positions: [{ x: 5, y: 0, state: 'FINE' }, { x: 6, y: 0, state: 'FINE' }],
        },
      ]);
      expect(resp.body.game_status).toBe('PROCESS');
      done();
    });
    test('get win with three ships', async (done) => {
      await request(app).post(attackUri).send({ position: { x: 0, y: 6 } });
      await request(app).post(attackUri).send({ position: { x: 1, y: 6 } });
      await request(app).post(attackUri).send({ position: { x: 0, y: 8 } });
      await request(app).post(attackUri).send({ position: { x: 1, y: 8 } });
      await request(app).post(attackUri).send({ position: { x: 5, y: 0 } });
      await request(app).post(attackUri).send({ position: { x: 6, y: 0 } });
      const resp = await request(app).get(getStatusUri);
      expect(resp.status).toBe(HttpStatus.OK);
      expect(resp.body.ships).toStrictEqual([
        {
          type: 'destroyer',
          state: ShipState.SUNK,
          axis: 'X',
          positions: [{ x: 0, y: 6, state: 'BROKEN' }, { x: 1, y: 6, state: 'BROKEN' }],
        },
        {
          type: 'destroyer',
          state: ShipState.SUNK,
          axis: 'X',
          positions: [{ x: 0, y: 8, state: 'BROKEN' }, { x: 1, y: 8, state: 'BROKEN' }],
        },
        {
          type: 'destroyer',
          state: ShipState.SUNK,
          axis: 'X',
          positions: [{ x: 5, y: 0, state: 'BROKEN' }, { x: 6, y: 0, state: 'BROKEN' }],
        },
      ]);
      expect(resp.body.game_status).toBe('WIN');
      done();
    });
  });
});
