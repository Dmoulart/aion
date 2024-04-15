import { onArchetypeChange } from "./archetype.js";
import { nextID } from "./id.js";
import type { World } from "./world.js";

export type ID = number;
/**
 * An entity is basically just an identifier, an unsigned integer.
 */
export type Entity = ID;

/**
 * Creates an entity, add it to the given world and returns it.
 * @param world
 * @param archetype
 * @throws {ExceededWorldCapacity}
 * @returns new entity's id
 */
export function createEntity(
  world: World,
  archetype = world.rootArchetype,
): Entity {
  const eid = world.deletedEntities.length
    ? world.deletedEntities.shift()!
    : nextID();

  // We start creating entities id from 1
  if (eid > world.size) {
    // todo: resize world automatically ?
    throw new ExceededWorldCapacity(
      `World maximum capacity of ${world.size} exceeded`,
    );
  }

  archetype.entities.insert(eid);
  world.entitiesArchetypes[eid] = archetype;

  return eid;
}

/**
 * Insert a specific entity. If the entity already exist it will do nothing.
 * Warning ! This will break the entity counter
 * @todo find a way to make this work while creating new entity in the classic way also ?
 * @param world
 * @param eid entity ID
 * @param archetype
 * @throws {ExceededWorldCapacity}
 */
export function insertEntity(
  world: World,
  eid: Entity,
  archetype = world.rootArchetype,
): Entity {
  // We start creating entities id from 1
  if (eid > world.size) {
    // todo: resize world automatically ?
    throw new ExceededWorldCapacity(
      `World maximum capacity of ${world.size} exceeded`,
    );
  }

  if (world.entitiesArchetypes[eid] === archetype) return eid;

  onArchetypeChange(world, eid, world.rootArchetype, archetype);

  archetype.entities.insert(eid);
  world.entitiesArchetypes[eid] = archetype;
  return eid;
}

/**
 * Remove an entity from the given world.
 * @param eid entity id
 * @param world
 * @throws {NonExistantEntity}
 * @returns nothing
 */
export function removeEntity(world: World, eid: Entity) {
  const archetype = world.entitiesArchetypes[eid];
  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to remove a non existant entity with id : ${eid}`,
    );
  }

  // transition to root archetype before being destroy to trigger some onExitQuery ?
  // @todo is this a good idea?
  onArchetypeChange(world, eid, archetype, world.rootArchetype);

  archetype.entities.remove(eid);
  world.entitiesArchetypes[eid] = undefined;

  world.deletedEntities.push(eid);
}

/**
 * Remove an entity from the given world and don't allow the entity to be recycled
 * @param eid entity id
 * @param world
 * @throws {NonExistantEntity}
 * @returns nothing
 */
export function forgetEntity(world: World, eid: Entity) {
  removeEntity(world, eid);
  world.deletedEntities.pop();
}

/**
 * Returns true if the world has the given entity.
 * @todo generation number in id to check if it has been recycled ?
 * @param world
   @param eid
 * @returns true if world contains the given entity
 */
export function entityExists(world: World, eid: Entity): boolean {
  return Boolean(world.entitiesArchetypes[eid]);
}

//@todo meta
// /**
//  * Clone the given entity with all its components values.
//  * @param world
//  * @param eid
//  * @returns cloned entity
//  */
// export function cloneEntity(world: World, eid: Entity) {
//   const components = getEntityComponents(world, eid);
//   const clone = createEntity(world)
//   //@todo:perf code generation
//   for (const component of components) {
//     const storage = getComponentByID(component as ComponentID)!;
//     const schema = getSchema(component)!;
//     if(isSingleTypeSchema(schema)){
//       (storage as any)[clone] = (storage as any)[eid]
//     }
//     else{
//       for
//     }
//   }
// }

export class NonExistantEntity extends Error {}
export class ExceededWorldCapacity extends Error {}
