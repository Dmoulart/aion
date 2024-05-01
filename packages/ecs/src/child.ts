import { attach } from "./component.js";
import { removeEntity, type ID, createEntity } from "./entity.js";
import { onEnterQuery, onExitQuery, query } from "./query.js";
import {
  RELATIONS_MASKS,
  defineRelation,
  getRelationID,
  getRelationTarget,
} from "./relation.js";
import { createWorld, type World } from "./world.js";

export const ParentOf = defineRelation();

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
console.log("child2:", child2);
console.log("parent of child", ParentOf(child));
console.log("parent relationship id ", getRelationID(ParentOf(child)));
console.log("parent relationship target ", getRelationTarget(ParentOf(child)));
console.log("mask has relation", mask.has(ParentOf(child)));

// console.log(mask);
const everyParents = query(w, ParentOf("*"));
const parentsOfChild = query(w, ParentOf(child));
const onParentCreated = onEnterQuery(everyParents);

onParentCreated((p) => console.log("parent created ?", p));

attach(w, ParentOf(child), parent);
attach(w, ParentOf(child2), parent);

console.log("Every parents", everyParents.first());
console.log("Parents of child", parentsOfChild.first());

const onParentRemove = onExitQuery(everyParents);

onParentRemove(() => {
  console.log("child removed");

  // removeEntity(w, getChild());
});
// console.log(RELATIONS_MASKS.get(getRelationID(ParentOf(child))));

// console.log({ child, traget: getRelationTarget(ParentOf(child)) });

// console.log("first", parents.first());

removeEntity(w, parent);
