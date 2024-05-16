import { getArchetypeRelationTarget } from "./archetype.js";
import { type Component, isComponent, getComponentID } from "./component.js";
import type { ID } from "./entity.js";
import { relations, type Relation, type Entity, type World } from "./index.js";

/**
 * The global ID cursor
 */
export let cursor = 0;

export function nextID(): ID {
  return ++cursor;
}

export function resetIDCursor() {
  cursor = 0;
}

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

export function isID(value: unknown): value is ID {
  return typeof value === "number";
}

export function collectIDs(compsOrIDs: (Component | ID)[]): ID[] {
  return compsOrIDs.map((compOrID) =>
    isComponent(compOrID) ? getComponentID(compOrID) : compOrID
  );
}

export function getID(component: ID | Component | Relation) {
  return typeof component === "number" // id
    ? component
    : typeof component === "function" && "baseID" in component // relation
    ? component.baseID
    : getComponentID(component); // component
}

export function isExclusiveRelation(relation: ID) {
  return relations[relation]?.exclusive;
}

export const getRelationID = lo;

export const getBaseID = lo;

export const getRelationTarget = hi;

export function isRelation(id: ID) {
  return getRelationID(id) !== id;
}

export function getEntityRelationTarget(
  world: World,
  entity: Entity,
  relation: Relation
) {
  return getArchetypeRelationTarget(
    relation.baseID,
    world.entitiesArchetypes[entity]!
  )!;
}
