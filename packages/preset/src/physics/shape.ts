import type { Entity } from "aion-ecs";
import { usePhysics } from "./init.js";
import { useECS } from "../ecs.js";
import { Circle, Rect } from "../components.js";
import type RAPIER from "@dimforge/rapier2d-compat";
import {
  getCircleRadius,
  getRectHeight,
  getRectWidth,
  toSimulationValue,
} from "../index.js";

export function getEntityPhysicalShape(entity: Entity) {
  const { RAPIER } = usePhysics();
  const { has } = useECS();

  let shape: RAPIER.Shape | undefined;

  if (has(Rect, entity)) {
    shape = new RAPIER.Cuboid(
      toSimulationValue(getRectWidth(entity)),
      toSimulationValue(getRectHeight(entity)),
    );
  } else if (has(Circle, entity)) {
    shape = new RAPIER.Ball(getCircleRadius(entity));
  }

  return shape;
}
