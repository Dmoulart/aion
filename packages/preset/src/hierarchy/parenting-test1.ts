import { type Entity, type World, defineRelation, i32 } from "aion-ecs";
import { useECS } from "../ecs.js";

const ChildOf = defineRelation({ test: i32 });
// export let ChildOf: Entity;
// export let ParentOf: Entity;

export function initHierarchy(world: World) {
  // ChildOf = createEntity(world);
  // ParentOf = createEntity(world);
}

export function addChildTo(parent: Entity, child: Entity) {
  const { attach } = useECS();
  attach(ChildOf(parent), child);
}

export function getFirstChildOf(parent: Entity) {
  const { query } = useECS();
  return query(ChildOf(parent)).archetypes?.[0]?.entities?.dense[0];

  // debugger;
  // const arch = getArchetype(world, parent)!;
  // for (const id of arch.mask.bits) {
  //   debugger;
  //   const loID = lo(id);
  //   const loParentOf = lo(ParentOf);
  //   if (lo(id) === lo(ParentOf)) {
  //     return hi(id);
  //   }
  // }
}

export function foreachChildOf(parent: Entity, cb: (ent: Entity) => void) {
  const { query } = useECS();
  query(ChildOf(parent)).each(cb);
  // const { world } = useECS();
  // const arch = getArchetype(world, parent)!;
  // const children: Array<Entity> = [];
  // for (const id of arch.mask.bits) {
  //   if (lo(id) === ParentOf) {
  //     children.push(hi(id));
  //   }
  // }
  // return children;
}
