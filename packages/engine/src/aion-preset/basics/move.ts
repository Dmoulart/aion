import type { Entity } from "aion-ecs";
import { Position } from "../components.js";
import type { Vec, Vector } from "aion-core";

export function setPosition(ent: Entity, pos: Vector) {
  Position.x[ent] = pos.x;
  Position.y[ent] = pos.y;
}
