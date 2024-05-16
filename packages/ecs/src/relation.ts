import { getArchetypeRelationTarget } from "./archetype.js";
import { type Entity, type ID } from "./entity.js";
import { hi, lo, nextID, pair } from "./id.js";
import {
  type AnyBitSet,
  type QueryTerm,
  BitSetImpl,
  testMatcher,
  type World,
} from "./index.js";

const isWildcard = (str: unknown): str is "*" => str === "*";

export const RELATIONS_MASKS = new Map<
  <T extends Entity | "*">(entityOrWildcard: T) => QueryTermOrID<T>,
  AnyBitSet
>();

type QueryTermOrID<T extends Entity | "*"> = T extends Entity ? ID : QueryTerm;
export type Relation = ReturnType<typeof defineRelation>;
export type RelationOptions = {
  exclusive: boolean;
};
export const relations: RelationOptions[] = [];

export function defineRelation(
  options: RelationOptions = { exclusive: false }
) {
  const baseID = nextID();

  const mask: AnyBitSet = new BitSetImpl();

  const relation = function <T extends Entity | "*">(
    entityOrWildcard: T
  ): QueryTermOrID<T> {
    if (isWildcard(entityOrWildcard)) {
      return testMatcher(mask, baseID) as QueryTermOrID<T>;
    }

    const entity = entityOrWildcard as Entity;
    // @todo number limit ?
    const id = pair(entity, baseID);

    // mask.or(id);

    return id as QueryTermOrID<T>;
  };

  RELATIONS_MASKS.set(relation, mask);
  relation.baseID = baseID;
  relation.mask = mask;
  relations[baseID] = options;
  return relation;
}
export function getRelationID(relation: ID) {
  return lo(relation);
}

export function getRelationTarget(relation: ID) {
  return hi(relation);
}

export function isExclusiveRelation(relation: ID) {
  return relations[relation]?.exclusive;
}

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
