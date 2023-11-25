import {
  type Entity,
  createEntity,
  entityExists,
  removeEntity,
  lo,
} from "./entity.js";
import {type Archetype, createArchetype} from "./archetype.js";
import {
  type QueryHandler,
  addQuery,
  any,
  type Query,
  none,
  not,
  all,
  query,
} from "./query.js";
import {attach, detach, hasComponent} from "./component.js";
import type {__SCHEMAS} from "./schemas.js";
import {
  type PrefabDefinition,
  type PrefabInstanceOptions,
  prefab,
} from "./prefab.js";
//@todo: remove capacity ?
export const DEFAULT_WORLD_CAPACITY = 100_000;

export const WORLD_MAX_SIZE = lo(Number.MAX_SAFE_INTEGER); // ???

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
   * The root archetype, which is the archetype corresponding to empty components
   */
  rootArchetype: Archetype;
  /**
   * The complete list of the world's archetypes
   */
  archetypes: Archetype[];
  /**
   * The registerd queries
   */
  queries: Map<number, Query>;
  /**
   * The callback to execute when entities enter the query or exit the query
   */
  handlers: {enter: Array<QueryHandler[]>; exit: Array<QueryHandler[]>};
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
    deletedEntities: [] as Entity[],
    entitiesArchetypes: [] as Archetype[],
    queries: new Map(),
    handlers: {
      enter: [] as Array<QueryHandler[]>,
      exit: [] as Array<QueryHandler[]>,
    },
    size,
  };
};

export const aion = (world: World = createWorld()) => {
  return {
    world,
    create: createEntity.bind(null, world),
    remove: removeEntity.bind(null, world),
    exists: entityExists.bind(null, world),
    has: hasComponent.bind(null, world),
    prefab: prefab.bind(null, world) as <Definition extends PrefabDefinition>(
      definition: Definition,
      options?: PrefabInstanceOptions<Definition>
    ) => ReturnType<typeof prefab<Definition>>, // hoolyyy mollyy
    attach: attach.bind(null, world),
    detach: detach.bind(null, world),
    query: query.bind(null, world),
    all,
    any,
    none,
    not,
  };
};

export class AboveWorldMaxSize extends Error {}
