import { attach } from "./component.js";
import {
  removeEntity,
  type ID,
  createEntity,
  type Entity,
  entityExists,
} from "./entity.js";
import type { SparseBitSet2 } from "./index.js";
import { onEnterQuery, onExitQuery, query } from "./query.js";
import {
  RELATIONS_MASKS,
  defineRelation,
  getRelationID,
  getRelationTarget,
} from "./relation.js";
import { createECS, createWorld, type World } from "./world.js";

export const ChildOf = defineRelation();

function initHierarchy(world: World) {
  // const parentOfBaseID = getRelationID(ParentOf(0));
  // const parents = query(
  //   world,
  //   withMask(RELATIONS_MASKS.get(parentOfBaseID)!, parentOfBaseID),
  // );
  // const onAddChild = onEnterQuery(parents);
  // const onChildRemove = onExitQuery(parents);
  // onChildRemove((parent) => {
  //   console.log("child removed");
  //   removeEntity(world, getChild(parent));
  // });
}

const w = createWorld();

initHierarchy(w);

const parent = createEntity(w);

const child = createEntity(w);
const child2 = createEntity(w);

const onChildCreated = onEnterQuery(query(w, ChildOf("*")));

attach(w, ChildOf(parent), child);
attach(w, ChildOf(parent), child2);

onChildCreated((e) => {
  console.log("child created", e);
});

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
