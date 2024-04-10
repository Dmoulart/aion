export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function getScaleCompensatedRotation(
  radians: number,
  scaleX: number,
  scaleY: number,
): number {
  return radians / (scaleX * scaleY);
}
