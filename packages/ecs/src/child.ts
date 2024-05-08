import { getArchetypeLastID, onArchetypeCreated } from "./archetype.js";
import {
  attach,
  onBeforeAddComponent,
  onBeforeRemoveComponent,
} from "./component.js";
import {
  removeEntity,
  type ID,
  createEntity,
  type Entity,
  entityExists,
} from "./entity.js";
import { nextID } from "./id.js";
import { SparseSet, hasComponent, type SparseBitSet2 } from "./index.js";
import {
  addQuery,
  any,
  createQuery,
  onEnterQuery,
  onExitQuery,
  query,
  runQuery,
} from "./query.js";
import {
  RELATIONS_MASKS,
  defineRelation,
  getRelationID,
  getRelationTarget,
} from "./relation.js";
import { createECS, createWorld, type World } from "./world.js";

export const ChildOf = defineRelation({ exclusive: true });
export const Parent = nextID();

onArchetypeCreated(ChildOf, (id) => {
  // world.componentIndex[baseID] ??= new BitSetImpl();
  // world.componentIndex[baseID]!.or(id);
  // console.log("hello");
  // ChildOf.mask.or(id);
});

const parents: (SparseSet | undefined)[] = [];
const children = [];

function getChildren(entity: Entity) {
  return parents[entity]?.dense!;
}

function initHierarchy(world: World) {
  const onParentDestroyed = onExitQuery(query(w, Parent));

  onParentDestroyed((parent) => {
    for (const child of getChildren(parent)) {
      removeEntity(world, child);
    }
    //clear sparseset?
    parents[parent] = undefined;
  });

  onBeforeAddComponent(ChildOf, (id, entity, w) => {
    ChildOf.mask.or(id);
    const parent = getRelationTarget(id);
    attach(w, Parent, parent);

    parents[parent] ??= new SparseSet();
    const set = parents[parent]!;
    set.insert(entity);
  });

  onBeforeRemoveComponent(ChildOf, (id, entity) => {
    ChildOf.mask.xor(id);

    const parent = getRelationTarget(id);
    parents[parent]!.remove(entity);
  });
}

const w = createWorld();

initHierarchy(w);

const parent = createEntity(w);

const child = createEntity(w);
const child2 = createEntity(w);

const onChildCreated = onEnterQuery(query(w, ChildOf("*")));

onChildCreated((e, arch) => {
  console.log("child created", e);
});

attach(w, ChildOf(parent), child);
attach(w, ChildOf(parent), child2);

attach(w, ChildOf(child), child2);

// console.log("childrenOfParent", getChildren(parent));
// console.log("childrenOfChild", getChildren(child));
console.log("child 2 parent", hasComponent(w, ChildOf(parent), child2));

removeEntity(w, parent);

console.log("ex", entityExists(w, child));
console.log("ex", entityExists(w, child2));

// const mask = RELATIONS_MASKS.get(ParentOf)!;

// console.log("parent:", parent);
// console.log("child:", child);
// console.log("child2:", child2);
// console.log("parent of child", ParentOf(child));
// console.log("parent relationship id ", getRelationID(ParentOf(child)));
// console.log("parent relationship target ", getRelationTarget(ParentOf(child)));
// console.log("mask has relation", mask.has(ParentOf(child)));

// // console.log(mask);
// const everyParents = query(w, ParentOf("*"));
// const parentsOfChild = query(w, ParentOf(child));
// const onParentCreated = onEnterQuery(everyParents);

// function getChildren(world: World, entity: Entity) {
//   const parentMask = world.entitiesArchetypes[entity]!.mask as SparseBitSet2;
//   const allParents = RELATIONS_MASKS.get(ParentOf) as SparseBitSet2;

//   const children = parentMask.intersection(allParents).toValues();

//   const out: Entity[] = [];

//   for (const child of children) {
//     out.push(getRelationTarget(child));
//   }

//   return out;

//   // (world.entitiesArchetypes[entity]!.mask as SparseBitSet2).intersection()
// }

// onParentCreated((p) => console.log("parent created ?", p));

// attach(w, ParentOf(child), parent);
// attach(w, ParentOf(child2), parent);

// console.log("Every parents", everyParents.first());
// console.log("Parents of child", parentsOfChild.first());
// console.log(getChildren(w, parent));
// const onParentRemove = onExitQuery(everyParents);

// onParentRemove((parent) => {
//   console.log("child removed");
//   getChildren(w, parent).forEach((child) => removeEntity(w, child));
//   // removeEntity(w, getChild());
// });
// // console.log(RELATIONS_MASKS.get(getRelationID(ParentOf(child))));

// // console.log({ child, traget: getRelationTarget(ParentOf(child)) });

// // console.log("first", parents.first());
// console.log("child exists", entityExists(w, child), entityExists(w, child2));
// console.log("parent removal");
// removeEntity(w, parent);
// console.log("child exists", entityExists(w, child), entityExists(w, child2));
