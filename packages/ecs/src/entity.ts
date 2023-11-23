import {nextID} from "./id.js";
import type {World} from "./world.js";

export type ID = number;
/**
 * An entity is basically just an identifier, an unsigned integer.
 */
export type Entity = ID;

/**
 * Creates an entity, add it in the given world and returns it.
 * @param world
 * @param archetype
 * @throws {ExceededWorldCapacity}
 * @returns new entity's id
 */
export const createEntity = (
  world: World,
  archetype = world.rootArchetype
): Entity => {
  const eid = world.deletedEntities.length
    ? world.deletedEntities.shift()!
    : nextID();

  // We start creating entities id from 1
  if (eid > world.size) {
    // todo: resize world automatically ?
    throw new ExceededWorldCapacity(
      `World maximum capacity of ${world.size} exceeded`
    );
  }

  archetype.entities.insert(eid);
  world.entitiesArchetypes[eid] = archetype;
  return eid;
};

/**
 * Remove an entity from the given world.
 * @param eid entity id
 * @param world
 * @throws {NonExistantEntity}
 * @returns nothing
 */
export const removeEntity = (world: World, eid: Entity) => {
  const archetype = world.entitiesArchetypes[eid];
  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to remove a non existant entity with id : ${eid}`
    );
  }
  archetype.entities.remove(eid);
  world.entitiesArchetypes[eid] = undefined;
  world.deletedEntities.push(eid);
};

/**
 * Returns true if the world has the given entity.
 * @todo generation number in id to check if it has been recycled ?
 * @param eid
 * @param world
 * @returns world has the given entity
 */
export const entityExists = (world: World, eid: Entity) =>
  Boolean(world.entitiesArchetypes[eid]);

export class NonExistantEntity extends Error {}
export class ExceededWorldCapacity extends Error {}

/**
 * Get the low part of an identifier
 * @param id
 * @returns low part of the identifier
 */
export const lo = (id: ID) => id & ((1 << 20) - 1);

/**
 * Get the high part of an identifier
 * @param id
 * @returns high part of an indentifier
 */
export const hi = (id: ID) => (id >> 20) & ((1 << 20) - 1);

/**
 * Combine two ids to make a pair.
 * @param a
 * @param b
 * @returns id as pair
 */
export const pair = (a: ID, b: ID) => (a << 20) | b;
