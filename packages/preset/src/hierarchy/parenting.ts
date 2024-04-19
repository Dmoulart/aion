import { assert } from "aion-core";
import {
  defineComponent,
  eid,
  hasComponent,
  type Entity,
  i32,
  u32,
  type Component,
} from "aion-ecs";
import { useECS } from "../ecs.js";

export const Children = defineComponent({ list: [eid, 10], length: u32 });
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

export function findNearestAncestorOf(
  entity: Entity,
  predicate: (ancestor: Entity) => boolean,
) {
  let parent = getParentOf(entity);

  while (parent) {
    if (predicate(parent)) {
      return parent;
    }

    parent = getParentOf(entity);
  }

  return undefined;
}

export function findNearestAncestorWithComponent(
  entity: Entity,
  component: Component,
) {
  const { has } = useECS();
  let parent = getParentOf(entity);

  while (parent) {
    if (has(component, parent)) {
      return parent;
    }

    parent = getParentOf(entity);
  }

  return undefined;
}

export function addChildTo(parent: Entity, child: Entity) {
  const { attach, world } = useECS();

  assert(!hasComponent(world, Parent, child), "Child already has a parent");

  Parent[child] = parent;

  const childIndex = Children.length[parent]++;

  assert(childIndex < 10, "Children limit overflow");

  Children.list[parent]![childIndex] = child;

  attach(Parent, child);
  attach(Children, parent);
}

export function removeChildren(parent: Entity) {
  forEachChildOf(parent, (child, i) => {
    Children.list[parent]![i] = 0;
    Parent[child] = 0;
  });

  Children.length[parent] = 0;
}

export function getFirstChildOf(parent: Entity) {
  return Children.list[parent]![0];
}

export function getLastChildOf(parent: Entity) {
  return Children.list[parent]![Children.length[parent]! - 1];
}

export function getChildrenCount(entity: Entity) {
  return Children.length[entity]!;
}

export function getChildren(entity: Entity) {
  return Children.list[entity]!;
}

export function findChildOf(
  parent: Entity,
  predicate: (entity: Entity) => boolean,
) {
  const children = getChildren(parent);

  for (let i = 0; i < getChildrenCount(parent); i++) {
    const child = children[i]!;
    if (predicate(child)) {
      return child;
    }
  }

  return undefined;
}

export function findFirstChildWithComponent(
  parent: Entity,
  component: Component,
) {
  const { has } = useECS();

  return findChildOf(parent, (child) => has(component, child));
}

export function forEachChildOf(
  parent: Entity,
  cb: (entity: Entity, index: number) => void,
) {
  const children = getChildren(parent);

  for (let i = 0; i < getChildrenCount(parent); i++) {
    cb(children[i]!, i);
  }
}

export function traverseDescendants(entity: Entity, cb: (ent: Entity) => void) {
  forEachChildOf(entity, (child) => {
    traverseDescendants(child, cb);
    cb(child);
  });
}
