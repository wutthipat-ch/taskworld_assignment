enum PlacementAxis {
  X = 'X',
  Y = 'Y'
}
export function getPlacementAxisFromStr(str: string): PlacementAxis {
  if (str.toLowerCase() === 'x') return PlacementAxis.X;
  return PlacementAxis.Y;
}
export default PlacementAxis;
