import { useECS, getRectWorldBounds } from "aion-preset";
import { Floor } from "./components";

export function getFloor() {
  const { query } = useECS();

  return query(Floor).first()!;
}
export function getFloorBounds() {
  return getRectWorldBounds(getFloor());
}
