import {
  attach,
  onBeforeAddComponent,
  onBeforeRemoveComponent,
} from "./component.js";
import { removeEntity, type Entity } from "./entity.js";
import { nextID } from "./id.js";
import {
  SparseSet,
  getEntityRelationTarget,
  getRelationTarget,
} from "./index.js";
import { onExitQuery, query } from "./query.js";
import { defineRelation } from "./relation.js";
import { type World } from "./world.js";

export const ChildOf = defineRelation({ exclusive: true });
export const Parent = nextID();

export const children: (SparseSet | undefined)[] = [];

export function getChildren(entity: Entity) {
  return children[entity]?.dense ?? [];
}

export function getParent(world: World, entity: Entity) {
  return getEntityRelationTarget(world, entity, ChildOf);
}

export function initHierarchy(world: World) {
  const onParentDestroyed = onExitQuery(query(world, Parent));

  onParentDestroyed((parent) => {
    for (const child of getChildren(parent)) {
      removeEntity(world, child);
    }

    children[parent]!.clear();
  });

  onBeforeAddComponent(ChildOf, (id, entity, w) => {
    ChildOf.mask.or(id);
    const parent = getRelationTarget(id);

    children[parent] ??= new SparseSet();

    attach(world, Parent, parent);

    const set = children[parent]!;
    set.insert(entity);
  });

  onBeforeRemoveComponent(ChildOf, (id, entity) => {
    ChildOf.mask.xor(id);

    const parent = getRelationTarget(id);
    children[parent]!.remove(entity);
  });
}
