import shipPlacementSchema from '../shipPlacementSchema';

describe('Schema must validate the request correctly', () => {
  const req = { type: '', position: { x: 0, y: 0 }, axis: 'x' };
  beforeEach(() => {
    req.type = 'BattleShip';
    req.position = { x: 0, y: 0 };
  });
  describe('Ship type is valid', () => {
    test('BattleShip', () => {
      req.type = 'BattleShip';
      expect(shipPlacementSchema.validate(req).error).toBeUndefined();
    });
    it('Cruiser', () => {
      req.type = 'Cruiser';
      expect(shipPlacementSchema.validate(req).error).toBeUndefined();
    });
    it('Destroyer', () => {
      req.type = 'Destroyer';
      expect(shipPlacementSchema.validate(req).error).toBeUndefined();
    });
    it('SubMarine', () => {
      req.type = 'SubMarine';
      expect(shipPlacementSchema.validate(req).error).toBeUndefined();
    });
  });
  test('Ship type is invalid', () => {
    req.type = 'SomeShip';
    expect(shipPlacementSchema.validate(req).error).toBeTruthy();
  });
  describe('Ship Position', () => {
    test('Position x is invalid', () => {
      req.position.x = 10;
      expect(shipPlacementSchema.validate(req).error).toBeTruthy();
    });
    test('Position y is invalid', () => {
      req.position.y = -2;
      expect(shipPlacementSchema.validate(req).error).toBeTruthy();
    });
    test('Position is valid', () => {
      req.position = { x: 0, y: 9 };
      expect(shipPlacementSchema.validate(req).error).toBeUndefined();
    });
  });
  describe('Placement axis', () => {
    test('invalid axis', () => {
      req.axis = 'Z';
      expect(shipPlacementSchema.validate(req).error).toBeTruthy();
    });
    test('valid axis X', () => {
      req.axis = 'X';
      expect(shipPlacementSchema.validate(req).error).toBeUndefined();
    });
    test('valid axis Y', () => {
      req.axis = 'Y';
      expect(shipPlacementSchema.validate(req).error).toBeUndefined();
    });
  });
});
