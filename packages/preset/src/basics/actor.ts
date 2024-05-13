import {
  $cid,
  collectIDs,
  createEntity,
  insertEntity,
  nextID,
  type Component,
  type Entity,
  type ID,
} from "aion-ecs";
import { Fill, Rect, Stroke } from "../components.js";
import { useECS } from "../ecs.js";
import {
  Transform,
  createTransform,
  setPosition,
  setRotation,
  setWorldPosition,
  setWorldRotation,
} from "./transform.js";
import { setFillColor } from "../render/fill.js";
import { buildArchetype } from "aion-ecs/dist/archetype.js";
import { setStrokeColor } from "../render/stroke.js";
import { addChildTo } from "../hierarchy/parenting.js";

let reservedEntity: Entity = nextID();
// export type CreateEntityCallback = (entity: Entity) => void;
// export type CreateEntityCommand =
//   | [ID, Record<string, any> | any]
//   | [undefined, undefined, CreateEntityCallback];

// export function entity(...commands: CreateEntityCommand[]) {
//   const { world } = useECS();

//   const ids = new Set<ID>();

//   const cbs = new Set<CreateEntityCallback>();

//   for (const command of commands) {
//     const id = command[0];
//     if (id !== undefined) {
//       ids.add(id);
//     } else {
//       cbs.add(command[2]);
//     }
//   }

//   const archetype = buildArchetype(Array.from(ids), world);

//   const entity = createEntity(world, archetype);

//   cbs.forEach((cb) => cb(entity));

//   return entity;
// }

export function actor(...components: (ID | Component | undefined)[]) {
  const { world } = useECS();

  let ids = collectIDs(components.filter(Boolean) as Array<ID | Component>);

  //@todo : perfs
  ids = [...new Set(ids)];

  const archetype = buildArchetype(ids, world);

  const entity = insertEntity(world, reservedEntity, archetype);

  reservedEntity = nextID();

  return entity;
}

export function transform(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
  createTransform(x, y, rotation, scaleX, scaleY, Transform[reservedEntity]);

  return Transform;
}

export function position(x = 0, y = 0) {
  setPosition(reservedEntity, { x, y });
  return Transform;
}

export function rotation(radians = 0) {
  setRotation(reservedEntity, radians);
  return Transform;
}

export function fill(color = "blue") {
  setFillColor(reservedEntity, color);
  return Fill;
}

export function stroke(color = "black") {
  setStrokeColor(reservedEntity, color);
  return Stroke;
}

export function rect(w = 50, h = 50) {
  Rect.w[reservedEntity] = w;
  Rect.h[reservedEntity] = h;
  return Rect;
}

export function child(...components: (ID | Component | undefined)[]) {
  const childEntity = actor(...components);
  addChildTo(reservedEntity, childEntity);
  return childEntity;
}
