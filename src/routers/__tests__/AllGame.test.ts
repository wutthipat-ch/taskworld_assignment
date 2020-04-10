/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable arrow-body-style */
import _ from 'lodash';
import { Connection } from 'typeorm';
import request from 'supertest';
import server from '../../server';
import database from '../../database';
import Router from '../Router';
import ShipRecord from '../../entities/ShipRecord';
import AttackingLogRecord from '../../entities/AttackingLogRecord';
import testDatabaseOptions from '../../configurations/testdatabase';
import Position from '../../models/Position';

describe('Regression test for all game running', () => {
  let connection: Connection;
  const app = server();
  const shipPlacementUri = '/api/ships';
  const attackUri = '/api/attack';
  const getStatusUri = '/api/status';
  const createNewGameUri = '/api/newgame';

  const battleShips = [new Position(0, 0)].map((position) => {
    return {
      type: 'battleship',
      position: { x: position.getX(), y: position.getY() },
      axis: 'X',
    };
  });
  const cruisers = [
    new Position(0, 2),
    new Position(0, 4),
  ]
    .map((position) => {
      return {
        type: 'cruiser',
        position: { x: position.getX(), y: position.getY() },
        axis: 'X',
      };
    });
  const destroyers = [
    new Position(0, 6),
    new Position(0, 8),
    new Position(5, 0),
  ]
    .map((position) => {
      return {
        type: 'destroyer',
        position: { x: position.getX(), y: position.getY() },
        axis: 'X',
      };
    });
  const submarines = [
    new Position(5, 2),
    new Position(5, 4),
    new Position(5, 6),
    new Position(5, 8),
  ]
    .map((position) => {
      return {
        type: 'submarine',
        position: { x: position.getX(), y: position.getY() },
        axis: 'X',
      };
    });
  beforeAll(async () => {
    connection = await database(testDatabaseOptions);
    Router.route(app);
  });
  afterAll(async () => {
    await connection.createQueryBuilder()
      .delete().from(ShipRecord)
      .execute();
    await connection.createQueryBuilder()
      .delete().from(AttackingLogRecord)
      .execute();
  });
  test('All api on this game platfrom must work correctly', async (done) => {
    // Place each battleships
    await Promise.all(battleShips.map((battleShip) => request(app).post(shipPlacementUri)
      .send(battleShip)));
    // Place each battleships
    await Promise.all(cruisers.map((cruiser) => request(app).post(shipPlacementUri)
      .send(cruiser)));
    // Place each battleships
    await Promise.all(destroyers.map((destroyer) => request(app).post(shipPlacementUri)
      .send(destroyer)));
    // Place each battleships
    await Promise.all(submarines.map((submarine) => request(app).post(shipPlacementUri)
      .send(submarine)));
    let expectedShipsResp = [
      {
        type: 'battleship',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 0, y: 0, state: 'FINE' }, { x: 1, y: 0, state: 'FINE' }, { x: 2, y: 0, state: 'FINE' }, { x: 3, y: 0, state: 'FINE' }],
      },
      {
        type: 'cruiser',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 0, y: 2, state: 'FINE' }, { x: 1, y: 2, state: 'FINE' }, { x: 2, y: 2, state: 'FINE' }],
      },
      {
        type: 'cruiser',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 0, y: 4, state: 'FINE' }, { x: 1, y: 4, state: 'FINE' }, { x: 2, y: 4, state: 'FINE' }],
      },
      {
        type: 'destroyer',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 0, y: 6, state: 'FINE' }, { x: 1, y: 6, state: 'FINE' }],
      },
      {
        type: 'destroyer',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 0, y: 8, state: 'FINE' }, { x: 1, y: 8, state: 'FINE' }],
      },
      {
        type: 'destroyer',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 5, y: 0, state: 'FINE' }, { x: 6, y: 0, state: 'FINE' }],
      },
      {
        type: 'submarine',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 5, y: 2, state: 'FINE' }, { x: 6, y: 2, state: 'FINE' }, { x: 7, y: 2, state: 'FINE' }],
      },
      {
        type: 'submarine',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 5, y: 4, state: 'FINE' }, { x: 6, y: 4, state: 'FINE' }, { x: 7, y: 4, state: 'FINE' }],
      },
      {
        type: 'submarine',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 5, y: 6, state: 'FINE' }, { x: 6, y: 6, state: 'FINE' }, { x: 7, y: 6, state: 'FINE' }],
      },
      {
        type: 'submarine',
        state: 'FLOAT',
        axis: 'X',
        positions: [{ x: 5, y: 8, state: 'FINE' }, { x: 6, y: 8, state: 'FINE' }, { x: 7, y: 8, state: 'FINE' }],
      },
    ];
    const createPostion = (x: number, y: number): any => {
      return { position: { x, y } };
    };
    const reduceBooleanAnd = (b1: boolean, b2: boolean): boolean => b1 && b2;
    const resp1 = await request(app).get(getStatusUri);
    expect(expectedShipsResp.map((shipResp) => _.some(resp1.body.ships as {
      type: string;
      state: string;
      axis: string;
      positions: {
        x: number;
        y: number;
        state: string;
      }[];
    }[], shipResp))
      .reduce(reduceBooleanAnd))
      .toBeTruthy();
    expect(resp1.body.game_status).toBe('PROCESS');
    // attack a point but not sink a ship
    await request(app).post(attackUri).send({ position: { x: 5, y: 8 } });
    expectedShipsResp[9].positions[0] = { x: 5, y: 8, state: 'BROKEN' };
    const resp2 = await request(app).get(getStatusUri);
    expect(expectedShipsResp.map((shipResp) => _.some(resp2.body.ships as {
      type: string;
      state: string;
      axis: string;
      positions: {
        x: number;
        y: number;
        state: string;
      }[];
    }[], shipResp))
      .reduce(reduceBooleanAnd))
      .toBeTruthy();
    expect(resp2.body.game_status).toBe('PROCESS');
    // attack multiple points to sink a ship
    await request(app).post(attackUri).send({ position: { x: 6, y: 8 } });
    await request(app).post(attackUri).send({ position: { x: 7, y: 8 } });
    expectedShipsResp[9].positions[1] = { x: 6, y: 8, state: 'BROKEN' };
    expectedShipsResp[9].positions[2] = { x: 7, y: 8, state: 'BROKEN' };
    expectedShipsResp[9].state = 'SUNK';
    const resp3 = await request(app).get(getStatusUri);
    expect(expectedShipsResp.map((shipResp) => _.some(resp3.body.ships as {
      type: string;
      state: string;
      axis: string;
      positions: {
        x: number;
        y: number;
        state: string;
      }[];
    }[], shipResp))
      .reduce(reduceBooleanAnd))
      .toBeTruthy();
    expect(resp3.body.game_status).toBe('PROCESS');
    // hit until end of game
    await Promise.all([
      createPostion(0, 0), createPostion(1, 0), createPostion(2, 0), createPostion(3, 0), createPostion(0, 2),
      createPostion(1, 2), createPostion(2, 2), createPostion(0, 4), createPostion(1, 4), createPostion(2, 4),
      createPostion(0, 6), createPostion(1, 6), createPostion(0, 8), createPostion(1, 8), createPostion(5, 0),
      createPostion(6, 0), createPostion(5, 2), createPostion(6, 2), createPostion(7, 2), createPostion(5, 4),
      createPostion(6, 4), createPostion(7, 4), createPostion(5, 6), createPostion(6, 6), createPostion(7, 6),
    ].map((attackRequest) => request(app).post(attackUri).send(attackRequest)));
    expectedShipsResp = expectedShipsResp.map((shipResp) => {
      return {
        type: shipResp.type,
        state: 'SUNK',
        axis: shipResp.axis,
        positions: shipResp.positions.map((position) => {
          return { x: position.x, y: position.y, state: 'BROKEN' };
        }),
      };
    });
    const resp4 = await request(app).get(getStatusUri);
    expect(expectedShipsResp.map((shipResp) => _.some(resp4.body.ships as {
      type: string;
      state: string;
      axis: string;
      positions: {
        x: number;
        y: number;
        state: string;
      }[];
    }[], shipResp))
      .reduce(reduceBooleanAnd))
      .toBeTruthy();
    expect(resp4.body.game_status).toBe('WIN');
    await request(app).post(createNewGameUri).send();
    const resp5 = await request(app).get(getStatusUri);
    expect(resp5.body.ships).toStrictEqual([]);
    expect(resp5.body.game_status).toBe('PROCESS');
    done();
  });
});
