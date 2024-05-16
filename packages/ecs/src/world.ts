import { type Entity } from "./entity.js";
import { type Archetype, createArchetype } from "./archetype.js";
import { type QueryHandler, type Query } from "./query.js";
import { type AnyBitSet } from "./index.js";
//@todo: remove capacity ?
export const DEFAULT_WORLD_CAPACITY = 100_000;

export const WORLD_MAX_SIZE = Number.MAX_SAFE_INTEGER & ((1 << 20) - 1); //  lo(Number.MAX_SAFE_INTEGER); // ???
export type World = {
  /**
   * The removed entities
   */
  deletedEntities: Array<Entity>;
  /**
   * The size of the world, in number of entities
   */
  size: number;
  /**
   * An array with entity id as index and corresponding archetype at the given index
   */
  entitiesArchetypes: (Archetype | undefined)[];

  /**
   * A mapping of component ID to archetypes containing this component
   */
  componentIndex: AnyBitSet[];

  /**
   * The root archetype, which is the archetype corresponding to empty components
   */
  rootArchetype: Archetype;
  /**
   * The complete list of the world's archetypes
   */
  archetypes: Archetype[];
  /**
   * The registerd queries, hash as key, query as value.
   */
  queries: Map<number, Query>;
  /**
   * The callback to execute when entities enter the query or exit the query
   */
  handlers: { enter: Array<QueryHandler[]>; exit: Array<QueryHandler[]> };
};

/**
 * Create a new world which will contain it's own archetypes and entities.
 * @param size or default world size
 * @throws {AboveWorldMaxSize}
 * @returns new world
 */
export const createWorld = (size = DEFAULT_WORLD_CAPACITY): World => {
  if (size > WORLD_MAX_SIZE) {
    throw new AboveWorldMaxSize(
      `World's' capacity cannot exceed ${WORLD_MAX_SIZE}`
    );
  }

  const root = createArchetype();

  return {
    rootArchetype: root,
    archetypes: [root],
    deletedEntities: [],
    entitiesArchetypes: [],
    componentIndex: [],
    queries: new Map(),
    handlers: {
      enter: [] as Array<QueryHandler[]>,
      exit: [] as Array<QueryHandler[]>,
    },
    size,
  };
};

export class AboveWorldMaxSize extends Error {}
