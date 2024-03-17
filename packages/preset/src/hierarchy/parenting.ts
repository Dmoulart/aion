import { assert } from "aion-core";
import {
  defineComponent,
  eid,
  hasComponent,
  type Entity,
  i32,
  u32,
} from "aion-ecs";
import { useECS } from "../ecs.js";

export const Children = defineComponent({ list: [eid, 3], length: u32 });
export const Parent = defineComponent(eid);

export function hasParent(entity: Entity) {
  const { world } = useECS();

  return hasComponent(world, Parent, entity);
}

export function hasChildren(entity: Entity) {
  const { has } = useECS();

  return has(Children, entity);
}

export function getParentOf(child: Entity) {
  return Parent[child];
}

export function addChildTo(parent: Entity, child: Entity) {
  const { attach, world } = useECS();

  assert(!hasComponent(world, Parent, child), "Child already has a parent");

  attach(Parent, child);

  Parent[child] = parent;

  attach(Children, parent);

  const childIndex = Children.length[parent]++;
  Children.list[parent]![childIndex] = child;
}

export function getFirstChildOf(parent: Entity) {
  return Children.list[parent]![0];
}

export function forEachChildOf(parent: Entity, cb: (ent: Entity) => void) {
  if (hasChildren(parent)) {
    for (const child of Children.list[parent]!) {
      if (child > 0) {
        cb(child);
      }
    }
  }
}
