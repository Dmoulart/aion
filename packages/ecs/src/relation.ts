import { type Entity, type ID } from "./entity.js";
import { hi, lo, nextID, pair } from "./id.js";
import {
  type AnyBitSet,
  type QueryTerm,
  BitSetImpl,
  testMatcher,
} from "./index.js";
import { DEFAULT_WORLD_CAPACITY } from "./world.js";

const isWildcard = (str: unknown): str is "*" => str === "*";

// const relations = new Set<ID>();

export const RELATIONS_MASKS = new Map<
  <T extends Entity | "*">(entityOrWildcard: T) => QueryTermOrID<T>,
  AnyBitSet
>();

type QueryTermOrID<T extends Entity | "*"> = T extends Entity ? ID : QueryTerm;

export function defineRelation() {
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

    mask.or(id);

    return id as QueryTermOrID<T>;
  };

  RELATIONS_MASKS.set(relation, mask);

  return relation;
}
export function getRelationID(relation: ID) {
  return lo(relation);
}

export function getRelationTarget(relation: ID) {
  return hi(relation);
}
