import type { AnyBitSet } from "./collections/bit-set.js";
import { BitSetImpl } from "./collections/bitset-impl.js";
import { type Entity, type ID } from "./entity.js";
import { nextID, pair } from "./id.js";
import { testMatcher, type QueryTerm } from "./query.js";

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
