import type {Component} from "./component.js";
import type {World} from "./world.js";
import type {Archetype} from "./archetype.js";
import type {Entity} from "./entity.js";
import {BitSet} from "./collections/index.js";

/**
 * A matcher represents the conditional expression used for every query operators.
 */
export type Matcher = (archetype: Archetype) => boolean;

export type QueryHandler = (entities: Entity) => void;

export type QueryTerm = {comps: Component[]; matcher: Matcher};

export const all = (...comps: Component[]): QueryTerm => {
  const mask = makeComponentsMask(comps);
  return {
    comps,
    matcher: (arch: Archetype) => arch.mask.contains(mask),
  };
};

export const any = (...comps: Component[]): QueryTerm => {
  const mask = makeComponentsMask(comps);
  return {
    comps,
    matcher: (arch: Archetype) => arch.mask.intersects(mask),
  };
};

export const none = (...comps: Component[]): QueryTerm => {
  const mask = makeComponentsMask(comps);
  return {
    comps,
    matcher: (arch: Archetype) => !arch.mask.contains(mask),
  };
};

export const not = (...comps: Component[]): QueryTerm => {
  const mask = makeComponentsMask(comps);
  return {
    comps,
    matcher: (arch: Archetype) => !arch.mask.intersects(mask),
  };
};

export type Query = {
  /**
   * The archetypes matching the query.
   */
  archetypes: Archetype[];

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
  handlers: {enter: Array<QueryHandler>; exit: Array<QueryHandler>};

  /**
   * Execute the given function for each entities.
   * It is slower than a classic for loop.
   * @param fn
   * @returns nothing
   */
  each: (fn: (eid: Entity, index: number) => void) => void;
};

/**
 * Create a mask from a list of components.
 * @param components
 * @returns mask
 */
export const makeComponentsMask = (components: Component<any>[]) =>
  components.reduce((mask, comp) => {
    mask.or(comp.id);
    return mask;
  }, new BitSet());

/**
 * Create a query without executing it or registering it to the world
 */
export function defineQuery(...terms: QueryTerm[]): Query {
  const archetypes: Archetype[] = [];
  return {
    matchers: terms.map((term) => term.matcher),
    archetypes,
    world: undefined,
    handlers: {enter: [], exit: []},
    each(fn: (eid: Entity, index: number) => void) {
      for (let i = 0; i < archetypes.length; i++) {
        const ents = archetypes[i]!.entities.dense;
        const len = ents.length;
        for (let j = 0; j < len; j++) {
          fn(ents[j]!, j);
        }
      }
    },
  };
}

/**
 * Define a query, register it to the world and returns it.
 * @returns query object
 */
export const query = (world: World, ...terms: QueryTerm[]): Query => {
  const q = defineQuery(...terms);

  addQuery(world, q);

  return q;
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
    archetypes.push(archetype);
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
      "Cannot register an already registered query."
    );
  }
  query.world = world;

  world.queries.push(query);

  // Execute the query, register the results in the query.
  query.archetypes = runQuery(world, query);

  // Register the handlers
  if (query.handlers.enter.length > 0) {
    query.handlers.enter.forEach((handler) =>
      registerEnterQueryHandler(handler, query, world)
    );
  }
  if (query.handlers.exit.length > 0) {
    query.handlers.exit.forEach((handler) =>
      registerExitQueryHandler(handler, query, world)
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
      "Cannot remove a query from a world it does not belongs to."
    );
  }

  const index = world.queries.indexOf(query);
  if (index === -1) return;
  world.queries.splice(index);

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
  world: World
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
  world: World
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
  world: World
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

// export type QueryTermOperation = "All" | "Any" | "Not" | "None";
// export type QueryTerm<
//   C extends ComponentId[] = any,
//   M extends QueryTermOperation = any
// > = {
//   __match: M;
//   ids: C;
// };

// // export function makeQuery<T extends QueryTerm[]>(...terms: T) {
// //   let world: World | undefined;

// //   const archetypes: Archetype[] = [];
// //   const matchers: Array<Matcher> = [];
// //   const handlers = {enter: [], exit: []};

// //   return {
// //     matchers,
// //     archetypes,
// //     world,
// //     handlers,
// //     terms,
// //     each(fn: (eid: Entity, index: number) => void) {
// //       for (let i = 0; i < archetypes.length; i++) {
// //         const ents = archetypes[i].entities.dense;
// //         const len = ents.length;
// //         for (let j = 0; j < len; j++) {
// //           fn(ents[j], j);
// //         }
// //       }
// //     },
// //   };
// // }

// export class $Query<T extends QueryTerms<any>> {
//   world: World | undefined;

//   archetypes: Archetype[] = [];
//   matchers: Array<Matcher> = [];
//   handlers = {enter: [], exit: []};

//   terms: T;

//   constructor(terms: T) {
//     this.terms = terms;
//   }

//   each(
//     fn: (eid: Entity, data: ComponentInstances<IdsFromQueryTerms<T>>) => void
//   ) {
//     for (let i = 0; i < this.archetypes.length; i++) {
//       const ents = this.archetypes[i].entities.dense;
//       const len = ents.length;
//       for (let j = 0; j < len; j++) {
//         fn(ents[j], {} as ComponentInstances<IdsFromQueryTerms<T>>);
//       }
//     }
//   }
// }

// export class QueryTerms<CurrentTerms extends QueryTerm[]> {
//   readonly terms: CurrentTerms;

//   constructor(...terms: CurrentTerms) {
//     this.terms = terms;
//   }

//   $all<Ids extends ComponentId[]>(...ids: Ids) {
//     return new QueryTerms(...this.terms, {
//       __match: "All",
//       ids,
//     } as const);
//   }

//   query() {
//     return new $Query(this);
//   }
// }

// export const $all = <Ids extends ComponentId[]>(...ids: Ids) => {
//   return new QueryTerms({
//     __match: "All",
//     ids,
//   } as const);
// };
// const a = defineComponent({x: i32, ok: ui32});
// const b = defineComponent({y: i32});
// const c = defineComponent({z: i32});
// const d = defineComponent({v: i32});
// const e = defineComponent({e: i32});
// const z = defineComponent({b: i32});

// const m = $all(a, b, c).$all(d).$all(e);

// m.query().each((id,) => {
//   // a.ok += 1c
//   position.x + c;
// });

// type InferTerms<T> = T extends QueryTerms<infer Terms> ? Terms : never;

// // type IdsFromTerms<T> = T extends Array<QueryTerm<infer ComponentIds>> ? FlatArray<ComponentIds, 1> : never;
// type IdsFromTerms<T> = T extends Array<QueryTerm<infer ComponentIds>>
//   ? FlatArray<ComponentIds, 1>
//   : never;
// type IdsFromQueryTerms<T> = T extends QueryTerms<infer Terms>
//   ? IdsFromTerms<Terms>
//   : never;
// type IdsFromQueryTermsAsArray<T> = T extends QueryTerms<any>
//   ? IdsFromQueryTerms<T>
//   : never;

// type QueryComponentsMap<T extends QueryTerms<any>> = T extends QueryTerms<any>
//   ? {
//       [id in IdsFromQueryTerms<T>]: Instance<InferSchemaFromID<id>>;
//     }
//   : never;

// // type QueryComponentsArray<T extends QueryTerms<any>> = QueryComponentsMap<T>[keyof QueryComponentsMap<T>][]

// type QueryComponentsArray<T extends QueryTerms<any>> = {
//   [idx: number]: QueryComponentsMap<T>[keyof QueryComponentsMap<T>];
// };
// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};

// let t11: IdsFromQueryTerms<typeof m>;
// let qc: Prettify<QueryComponentsMap<typeof m>> = {} as any;
// // qc[a].
// let qa: Prettify<QueryComponentsArray<typeof m>> = {} as any;
// // type EntityProxy<T extends QueryTerms<any>> = {
// //   [component in keyof InferTerms<T>[number]['ids']]: InferTerms<T>[number]['ids'] extends Array<ComponentId<infer S>>?  {
// //     [prop in keyof S]: Value<S[prop]>
// //   } : never
// // }
// // export type QueryEntity<QT extends QueryTerms<any>> = Map<
// //   QT['terms']
// //  EntityProxy<QT>
// // >;
// // type QueryTermsIDS<T extends QueryTerms<any>> = {
// //   [group in keyof InferTerms<T>[number]["ids"]]:  FlatArray<InferTerms<T>[group]['ids'], 1>
// // }

// // type QueryProxyObjects<T extends QueryTerms<any>> = {
// //   [component in keyof InferTerms<T>[number]["ids"]]: PrefabOptions<IdsFromTerm<InferTerms<T>[component]>>;
// // };

// // type QueryProxyObjects2<T extends QueryTerm<any>[]> = {
// //   [component in keyof T[number]["ids"]]: PrefabOptions<IdsFromTerm<T[component]>>;
// // };

// type Map<T, U> = {[K in keyof T]: U};

// // // let t: EntityProxy<typeof m['terms']> = {} as any
// // let t: InferTerms<typeof m>;

// // t.

// // let t2: QueryProxyObjects<typeof m>;
// // t2.

// // let ids: QueryTermsIDS<typeof m>
// // ids.

// // let t3: QueryEntity<typeof m>;
// // t3[0][0]
// //   let t :{
// //   [component in keyof InferSchemaFromID<typeof m['terms'][number]['ids']>]: number
// // } = {
// //     x: 1,
// //   fdskj: 2
// // }
// // t
// // export const $all = <Ids extends ComponentId[]>(
// //   ...ids: Ids
// // ): QueryTerm<Ids, "All"> => {
// //   return {
// //     __match: "All",
// //     ids: ids,
// //   };
// // };

// export const $any = <Ids extends ComponentId[]>(
//   ...ids: Ids
// ): QueryTerm<Ids, "Any"> => {
//   return {
//     __match: "Any",
//     ids: ids,
//   };
// };

// export const $not = <Ids extends ComponentId[]>(
//   ...ids: Ids
// ): QueryTerm<Ids, "Not"> => {
//   return {
//     __match: "Not",
//     ids: ids,
//   };
// };

// export const $none = <Ids extends ComponentId[]>(
//   ...ids: Ids
// ): QueryTerm<Ids, "None"> => {
//   return {
//     __match: "None",
//     ids: ids,
//   };
// };

// // export class QueryTerm<T extends QueryTerm[]> {}

// export type ComponentInstances<
//   T extends ComponentId[],
//   U extends unknown[] = []
// > = T extends []
//   ? U
//   : T extends [infer Head, ...infer Tail]
//   ? Tail extends ComponentId[]
//     ? Head extends ComponentId<infer Schema>
//       ? ComponentInstances<
//           Tail,
//           Instance<Schema> extends never ? U : [...U, Instance<Schema>]
//         >
//       : never
//     : never
//   : never;

// declare let o: ComponentInstances<[typeof a, typeof b]>;
