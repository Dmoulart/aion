import type { Entity } from "aion-ecs";
import { Position } from "../components.js";
import { Vec, type Vector } from "aion-core";

export function setPosition(ent: Entity, pos: Vector) {
  Position.x[ent] = pos.x;
  Position.y[ent] = pos.y;
}

export function positionOf(ent: Entity): Vector {
  return new Vec(Position.x[ent], Position.y[ent]);
}
