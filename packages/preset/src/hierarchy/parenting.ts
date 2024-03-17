import { assert } from "aion-core";
import { defineComponent, eid, hasComponent, type Entity } from "aion-ecs";
import { useECS } from "../ecs.js";

const Children = defineComponent([eid, 3]);
const Parent = defineComponent(eid);

export function addChildTo(parent: Entity, child: Entity) {
  const { attach, world } = useECS();

  assert(!hasComponent(world, Parent, child), "Child already has a parent");

  attach(Parent, child);
  Parent[child] = parent;

  attach(Children, parent);
  Children[parent]![0] = child;
}

export function getFirstChildOf(parent: Entity) {
  return Children[parent]![0];
}

export function foreachChildOf(parent: Entity, cb: (ent: Entity) => void) {
  for (const child of Children[parent]!) {
    if (child > 0) {
      cb(child);
    }
  }
}
