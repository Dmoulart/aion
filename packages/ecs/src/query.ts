import {
  isComponent,
  type Component,
  type ComponentsGroup,
  getComponentID,
} from "./component.js";
import type { World } from "./world.js";
import type { Archetype } from "./archetype.js";
import type { Entity, ID } from "./entity.js";
import { BitSetImpl, SparseSet } from "./collections/index.js";
import { collectIDs } from "./id.js";

/**
 * A matcher represents the conditional expression used for every query operators.
 */
export type Matcher = (archetype: Archetype) => boolean;

export type QueryHandler = (entities: Entity) => void;
export type RegisteredQueryHandler = {
  (entities: Entity): void;
  queryHash: number;
};
export const QueryTermType = {
  All: 0,
  Any: 1,
  None: 2,
  Not: 3,
} as const;
export type QueryTerm = { type: number; matcher: Matcher; ids: ID[] };

export const all = (...compsOrIDs: (Component | ID)[]): QueryTerm => {
  const ids = collectIDs(compsOrIDs);

  const mask = makeIDsMask(ids);

  return {
    type: QueryTermType.All,
    ids,
    matcher: (arch: Archetype) => arch.mask.contains(mask),
  };
};

export const any = (...compsOrIDs: (Component | ID)[]): QueryTerm => {
  const ids = collectIDs(compsOrIDs);

  const mask = makeIDsMask(ids);

  return {
    type: QueryTermType.Any,
    ids,
    matcher: (arch: Archetype) => arch.mask.intersects(mask),
  };
};

export const none = (...compsOrIDs: (Component | ID)[]): QueryTerm => {
  const ids = collectIDs(compsOrIDs);

  const mask = makeIDsMask(ids);

  return {
    type: QueryTermType.None,
    ids,
    matcher: (arch: Archetype) => !arch.mask.contains(mask),
  };
};

export const not = (...compsOrIDs: (Component | ID)[]): QueryTerm => {
  const ids = collectIDs(compsOrIDs);

  const mask = makeIDsMask(ids);

  return {
    type: QueryTermType.Not,
    ids,
    matcher: (arch: Archetype) => !arch.mask.intersects(mask),
  };
};

export const isQueryTerm = (obj: object): obj is QueryTerm => "matcher" in obj;

export type Query = {
  /**
   * The terms defining the query
   */
  hash: number;

  /**
   * The archetypes matching the query.
   */
  archetypes: Archetype[];

  /**
   * A set containing the matching archetypes ID.
   */
  archetypesSet: SparseSet;

  /**
   * The query matchers.
   */
  matchers: Array<Matcher>;

  /**
   * The world this query is attached to.
   */
  world?: World;

  /**
   * The callback to execute when entities enter the query or exit the query.
   */
  handlers: { enter: Array<QueryHandler>; exit: Array<QueryHandler> };

  /**
   * Execute the given function for each entities.
   * It is slower than a classic for loop.
   * @param fn
   * @returns nothing
   */
  each: (fn: (eid: Entity, index: number) => void) => void;

  first(): Entity | undefined;
};

/**
 * Create a mask from a list of components.
 * @param components
 * @returns mask
 */
export const makeComponentsMask = (components: Component[]) =>
  components.reduce((mask, comp) => {
    mask.or(getComponentID(comp));
    return mask;
  }, new BitSetImpl(2));

/**
 * Create a mask from a list of Ids.
 * @param ids
 * @returns mask
 */
export const makeIDsMask = (ids: Array<ID>) =>
  ids.reduce((mask, id) => {
    mask.or(id);
    return mask;
  }, new BitSetImpl(2));

const hashQueryTerms = (terms: QueryTerm[]) => {
  let hash = 5381;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i]!;
    const type = term.type;

    hash = (hash << 5) + hash + type;

    for (let j = 0; j < term.ids.length; j++) {
      const id = term.ids[j]!;
      hash = (hash << 5) + hash + id;
    }
  }

  return hash;
};

/**
 * Define a query that can be added to world
 */
export function defineQuery(...terms: QueryTerm[]): (world: World) => Query {
  // @todo also done in create query
  const hash = hashQueryTerms(terms);

  return function query(world: World) {
    let query = world.queries.get(hash);

    if (!query) {
      query = createQuery(...terms);
      addQuery(world, query);
    }

    return query;
  };
}

export function createQuery(...terms: QueryTerm[]): Query {
  return {
    hash: hashQueryTerms(terms),
    matchers: terms.map((term) => term.matcher),
    archetypesSet: new SparseSet(),
    archetypes: [],
    world: undefined,
    handlers: { enter: [], exit: [] },
    each(fn: (eid: Entity, index: number) => void) {
      for (let i = 0; i < this.archetypes.length; i++) {
        const ents = this.archetypes[i]!.entities.dense;
        for (let j = 0; j < ents.length; j++) {
          fn(ents[j]!, j);
        }
      }
    },
    first() {
      for (let i = 0; i < this.archetypes.length; i++) {
        const ents = this.archetypes[i]!.entities.dense;
        if (ents.length) {
          return ents[0];
        }
      }
    },
  };
}

type QueryElement = Component | QueryTerm | ComponentsGroup | ID;
/**
 * Define a query, register it to the world and returns it.
 * Query terms or components can be used to define this query.
 * All the plain components passed as parameters will automatically be grouped in an 'all' query term.
 * @todo simplify, make this more performant, don't call define query each time
 * @param world the world in which the query will execute
 * @param termsOrComponents the query terms or components the query will target.
 * @returns query object
 */
export const query = <T extends Array<QueryElement>>(
  world: World,
  ...termsOrComponents: T
): Query => {
  // @todo way to cache the query before doing all this, simplify api ?
  const queryTerms: QueryTerm[] = [];
  const freeFloatingIDS: ID[] = [];

  for (const termOrComponent of termsOrComponents) {
    if (typeof termOrComponent === "number") {
      freeFloatingIDS.push(termOrComponent);
    } else if (isComponent(termOrComponent)) {
      freeFloatingIDS.push(getComponentID(termOrComponent));
    } else if (isQueryTerm(termOrComponent)) {
      queryTerms.push(termOrComponent);
    }
    //component group
    // else {
    //   freeFloatingIDS.push(
    //     ...Object.values(termOrComponent as ComponentsGroup),
    //   );
    // }
  }

  if (freeFloatingIDS.length > 0) {
    queryTerms.push(all(...freeFloatingIDS));
  }

  const q = defineQuery(...queryTerms);

  return q(world);
};

/**
 * Execute the query against the a world's archetypes.
 * The resulting archetypes are not cached.
 * This function has no side effects.
 * @param query
 * @returns matched archetypes
 */
export function runQuery(world: World, query: Query): Archetype[] {
  const archetypes = [];

  archloop: for (const archetype of world.archetypes) {
    for (const match of query.matchers) {
      if (!match(archetype)) continue archloop;
    }
    // could unify these two ops
    archetypes.push(archetype);
    query.archetypesSet.insert(archetype.id);
  }

  return archetypes;
}

/**
 * Register a query in the given world.
 * The query results will be automatically updated when new archetypes are created.
 * @param query the query to register
 * @param world
 * @returns the registered query
 */
export const addQuery = (world: World, query: Query): Query => {
  // // Throw an error if query is already registered
  if (query.world) {
    throw new AlreadyRegisteredQueryError(
      "Cannot register an already registered query.",
    );
  }
  query.world = world;
  world.queries.set(query.hash, query);

  // Execute the query, register the results in the query.
  query.archetypes = runQuery(world, query);

  // Register the handlers
  if (query.handlers.enter.length > 0) {
    query.handlers.enter.forEach((handler) =>
      registerEnterQueryHandler(handler, query, world),
    );
  }
  if (query.handlers.exit.length > 0) {
    query.handlers.exit.forEach((handler) =>
      registerExitQueryHandler(handler, query, world),
    );
  }

  return query;
};

/**
 * Unregister the query from the given world.
 * The query results will be automatically updated when new archetypes are created.
 * @param query the query to register
 * @param world
 * @throws {RemoveQueryError}
 */
export const removeQuery = (world: World, query: Query) => {
  if (query.world !== world) {
    throw new RemoveQueryError(
      "Cannot remove a query from a world it does not belongs to.",
    );
  }

  world.queries.delete(query.hash);

  // Delete the enter handlers
  if (query.handlers.enter.length > 0) {
    for (const archetype of query.archetypes) {
      for (const handler of query.handlers.enter) {
        const index = world.handlers.enter[archetype.id]!.indexOf(handler);
        if (index === -1) continue;
        world.handlers.enter[archetype.id]!.splice(index);
      }
    }
  }

  // Delete the exit handlers
  if (query.handlers.exit.length > 0) {
    for (const archetype of query.archetypes) {
      for (const handler of query.handlers.exit) {
        const index = world.handlers.exit[archetype.id]!.indexOf(handler);
        if (index === -1) continue;
        world.handlers.exit[archetype.id]!.splice(index);
      }
    }
  }

  query.world = undefined;
  query.archetypes = [];
};

/**
 * Returns true if an archetype is matched by a given query.
 * @param query
 * @param archetype
 * @returns true if archetype components match query
 */
export const matchQuery = (query: Query, archetype: Archetype): boolean => {
  for (const match of query.matchers) {
    if (!match(archetype)) {
      return false;
    }
  }
  return true;
};

/**
 * Attach to the given archetypes a set of enter and exit query callbacks.
 * @param archetype
 * @param query
 * @param world
 */
export const registerQueryHandlersForArchetype = (
  archetype: Archetype,
  query: Query,
  world: World,
) => {
  if (query.handlers.enter.length > 0) {
    world.handlers.enter[archetype.id] ??= [];
    world.handlers.enter[archetype.id]!.push(...query.handlers.enter);
  }
  if (query.handlers.exit.length > 0) {
    world.handlers.exit[archetype.id] ??= [];
    world.handlers.exit[archetype.id]!.push(...query.handlers.exit);
  }
};

/**
 * Register the enter query callbacks of the given query for the given world.
 * @param handler the callback function
 * @param query
 * @param world
 */
export const registerEnterQueryHandler = (
  handler: QueryHandler,
  query: Query,
  world: World,
) => {
  for (const archetype of query.archetypes) {
    world.handlers.enter[archetype.id] ??= [];
    world.handlers.enter[archetype.id]!.push(handler);
  }
};

/**
 * Register the exit query callbacks of the given query for the given world.
 * @param handler the callback function
 * @param query
 * @param world
 */
export const registerExitQueryHandler = (
  handler: QueryHandler,
  query: Query,
  world: World,
) => {
  for (const archetype of query.archetypes) {
    world.handlers.exit[archetype.id] ??= [];
    world.handlers.exit[archetype.id]!.push(handler);
  }
};

/**
 * Generates a factory function that will be used to create callbacks that will execute when one or multiple entities
 * start to match the given query.
 * @param query
 */
export const onEnterQuery = (query: Query) => {
  return (fn: QueryHandler) => {
    (fn as RegisteredQueryHandler).queryHash = query.hash;

    query.handlers.enter.push(fn);
    // If query is not tied to any world, the registration of the handlers will take
    // place during the registration of the query
    if (query.world) {
      registerEnterQueryHandler(fn, query, query.world);
    }
  };
};

/**
 * Generates a factory function that will be used to create callbacks that will execute when one or multiple entities
 * no longer match the given query.
 * @param query
 */
export const onExitQuery = (query: Query) => {
  return (fn: QueryHandler) => {
    (fn as RegisteredQueryHandler).queryHash = query.hash;

    query.handlers.exit.push(fn);
    // If query is not tied to any world, the registration of the handlers will take
    // place during the registration of the query
    if (query.world) {
      registerExitQueryHandler(fn, query, query.world);
    }
  };
};

export class AlreadyRegisteredQueryError extends Error {}
export class RemoveQueryError extends Error {}
