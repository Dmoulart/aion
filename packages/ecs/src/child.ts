import { attach } from "./component.js";
import { removeEntity, type ID, createEntity, entityExists } from "./entity.js";
import { SparseBitSet } from "./index.js";
import { every, onEnterQuery, onExitQuery, query, withMask } from "./query.js";
import {
  RELATIONS_MASKS,
  defineRelation,
  getRelationID,
  getRelationTarget,
} from "./relation.js";
import { createWorld, type World } from "./world.js";

export const ParentOf = defineRelation();

function getChild(id: ID) {
  return getRelationTarget(id);
}

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

const mask = RELATIONS_MASKS.get(getRelationID(ParentOf(child)))!;

console.log("parent:", parent);
console.log("child:", child);
console.log("parent of child", ParentOf(child));
console.log("parent relationship id ", getRelationID(ParentOf(child)));
console.log("parent relationship target ", getRelationTarget(ParentOf(child)));
console.log("mask has relation", mask.has(ParentOf(child)));

attach(w, ParentOf(child), parent);
// attach(w, ParentOf(child2), parent);

const everyParents = query(w, ParentOf("*"));
const parentsOfChild = query(w, ParentOf(child));
console.log("Every parents", everyParents.first());
console.log("Parents of child", parentsOfChild.first());

const onChildRemove = onExitQuery(everyParents);
const onFirstChildRemove = onExitQuery(parentsOfChild);

onChildRemove((parent) => {
  console.log("child removed");

  // removeEntity(w, getChild());
});
// console.log(RELATIONS_MASKS.get(getRelationID(ParentOf(child))));

// console.log({ child, traget: getRelationTarget(ParentOf(child)) });

// console.log("first", parents.first());

removeEntity(w, parent);
