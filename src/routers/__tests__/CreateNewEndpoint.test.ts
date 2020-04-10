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
import PlacementAxis from '../../models/PlacementAxis';
import Ship from '../../models/Ship';


describe('Create new game endpoint should work correctly in', () => {
  let connection: Connection;
  const app = server();
  const createNewGameUri = '/api/newgame';
  beforeAll(async () => {
    connection = await database(testDatabaseOptions);
    Router.route(app);
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
    let hitUUID = '';
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
        if (index === 3) hitUUID = uuid;
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
    const logRecords = [
      { position: new Position(0, 0), result: AttackResult.MISS, gameState: GameState.PROCESS },
      { position: new Position(0, 3), result: AttackResult.MISS, gameState: GameState.PROCESS },
      {
        position: new Position(0, 4),
        result: AttackResult.HIT,
        gameState: GameState.PROCESS,
        hitShipId: hitUUID,
        hitShipType: new Cruiser(),
      },
    ];
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
  test('create new game successfully', async (done) => {
    const resp = await request(app).post(createNewGameUri);
    const logRecords = await connection.createQueryBuilder().select().from(AttackingLogRecord, 'al').execute();
    const shipRecords = await connection.createQueryBuilder().select().from(ShipRecord, 'sh').execute();
    expect(resp.status).toBe(HttpStatus.CREATED);
    expect(logRecords).toStrictEqual([]);
    expect(shipRecords).toStrictEqual([]);
    done();
  });
});
