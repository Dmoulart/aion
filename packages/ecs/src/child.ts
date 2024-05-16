import {
  attach,
  onBeforeAddComponent,
  onBeforeRemoveComponent,
} from "./component.js";
import { removeEntity, type Entity } from "./entity.js";
import { nextID } from "./id.js";
import { SparseSet, getEntityRelationTarget } from "./index.js";
import { onExitQuery, query } from "./query.js";
import { defineRelation, getRelationTarget } from "./relation.js";
import { type World } from "./world.js";

export const ChildOf = defineRelation({ exclusive: true });
export const Parent = nextID();

// onArchetypeCreated(ChildOf, (id) => {
//   // world.componentIndex[baseID] ??= new BitSetImpl();
//   // world.componentIndex[baseID]!.or(id);
//   // console.log("hello");
//   // ChildOf.mask.or(id);
// });

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
    console.log("[onBeforeAddComponent]", entity);
    ChildOf.mask.or(id);
    const parent = getRelationTarget(id);

    children[parent] ??= new SparseSet();
    const set = children[parent]!;

    attach(world, Parent, parent);

    set.insert(entity);
  });

  onBeforeRemoveComponent(ChildOf, (id, entity) => {
    console.log("remove child");
    ChildOf.mask.xor(id);

    const parent = getRelationTarget(id);
    children[parent]!.remove(entity);
  });
}

// const w = createWorld();

// initHierarchy(w);

// const parent = createEntity(w);

// const onChildCreated = onEnterQuery(query(w, ChildOf("*")));

// onChildCreated((e, arch) => {
//   console.log("child created", e);
// });

// const child = createEntity(w);
// const grandchild = createEntity(w);
// const secondparent = createEntity(w);

// console.log("child", child);
// console.log("grandchild", grandchild);
// console.log("secondparent", secondparent);

// attach(w, ChildOf(parent), child);
// console.log("attach child to parent ");
// attach(w, ChildOf(child), grandchild);
// console.log("attach child to grandchild");
// console.log("parent of child", getParent(w, child));
// debugger;
// attach(w, ChildOf(secondparent), child);
// console.log("attach child to second parent");
// console.log("parent of child", getParent(w, child));
// console.log("children of second parent", getChildren(secondparent));
// console.log("children of child", getChildren(child));
// console.log("remove secondparent");
// removeEntity(w, secondparent);
// console.log("child exists");
// console.log(entityExists(w, child));
// console.log("grandchild exists");
// console.log(entityExists(w, grandchild));

// console.log("ex", entityExists(w, child2));

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
