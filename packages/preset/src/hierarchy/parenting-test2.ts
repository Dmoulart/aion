import {
  createEntity,
  hasComponent,
  type Entity,
  type World,
  attach,
  pair,
  lo,
  hi,
} from "aion-ecs";
import { useECS } from "../ecs.js";
import { assert } from "aion-core";
import { getArchetype } from "aion-ecs/dist/archetype.js";

export let ChildOf: Entity;
export let ParentOf: Entity;

export function initHierarchy(world: World) {
  ChildOf = createEntity(world);
  ParentOf = createEntity(world);
}

export function addChildTo(parent: Entity, child: Entity) {
  const { world } = useECS();

  assert(!hasComponent(world, ChildOf, child), "Child already has a parent");

  attach(world, ChildOf, child);
  attach(world, ParentOf, parent);

  attach(world, pair(ParentOf, child), parent);
  attach(world, pair(ChildOf, parent), child);
}

export function getFirstChildOf(parent: Entity) {
  const { world } = useECS();
  debugger;
  const arch = getArchetype(world, parent)!;

  for (const id of arch.mask.bits) {
    debugger;
    const loID = lo(id);
    const loParentOf = lo(ParentOf);
    if (lo(id) === lo(ParentOf)) {
      return hi(id);
    }
  }
}

export function getChildrenOf(parent: Entity) {
  const { world } = useECS();
  const arch = getArchetype(world, parent)!;
  const children: Array<Entity> = [];

  for (const id of arch.mask.bits) {
    if (lo(id) === ParentOf) {
      children.push(hi(id));
    }
  }

  return children;
}
