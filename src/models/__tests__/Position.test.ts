import Position from '../Position';

describe('Position model must validate the inputs correctly', () => {
  test('Throw Error in constructor with invalid x', () => {
    expect(() => new Position(10, 1)).toThrow(Error);
  });
  it('Throw Error in constructor with invalid y', () => {
    expect(() => new Position(2, 10)).toThrow(Error);
  });
  it('Pass in constructor with valid x and y', () => {
    const position = new Position(2, 3);
    expect(position.getX()).toBe(2);
    expect(position.getY()).toBe(3);
  });
  it('Throw error in method setX and setY with invalid x and y', () => {
    const position = new Position(0, 9);
    expect(() => position.setX(-1)).toThrow(Error);
    expect(() => position.setY(10)).toThrow(Error);
  });
  it('Pass in method setX and setY with valid x and y', () => {
    const position = new Position(3, 5);
    position.setX(7);
    position.setY(8);
    expect(position.getX()).toBe(7);
    expect(position.getY()).toBe(8);
  });
});
describe('Method fromDBString must create the position instance correctly', () => {
  test('when there is any white space surronding the string', () => {
    const position = Position.fromDBString('  1,3 ');
    expect(position.getX()).toBe(1);
    expect(position.getY()).toBe(3);
  });
});
describe('Method toDBString must create the string with expected format', () => {
  test('when the position is valid', () => {
    const position = new Position(0, 9);
    expect(position.toDBString()).toBe('0,9');
  });
});
