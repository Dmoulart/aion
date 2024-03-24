import type { ComponentID } from "./component.js";
import { type World } from "./world.js";
import { type Entity, type ID } from "./entity.js";
import { BitSet, SparseSet } from "./collections/index.js";
import {
  matchQuery,
  registerQueryHandlersForArchetype,
  type RegisteredQueryHandler,
} from "./query.js";

//@todo make this a class for better perfs ?
export type Archetype = {
  /**
   * The archetype id.
   */
  id: Readonly<ID>;
  /**
   * The set of entities belonging to this archetype
   */
  entities: SparseSet;
  /**
   * The adjacent archetypes in the archetype graph
   */
  edge: (Archetype | undefined)[];
  /**
   * The archetype mask based on the components ids
   */
  mask: BitSet;
  /**
   * The components ids posessed by the archetype
   */
  components: Readonly<ID[]>;
};

// The next archetype id.
let nextAid = 0;

/**
 * Creates a new archetype with the specified bitmask.
 * @param mask
 * @returns new archetype
 */
export const createArchetype = (mask = new BitSet(2)): Archetype => {
  const id = ++nextAid;

  return {
    id,
    entities: new SparseSet(),
    edge: [],
    mask,
    components: [],
  };
};

/**
 * Composes an archetype from an array of components.
 * It will also register all the intermediate archetypes in the world archetype graph.
 * @param components
 * @param world
 */
export const buildArchetype = (components: ComponentID[], world: World) => {
  let archetype = world.rootArchetype;
  for (const component of components) {
    if (archetype.edge[component]) {
      archetype = archetype.edge[component]!;
    } else {
      archetype = deriveArchetype(archetype, component, world);
    }
  }
  return archetype;
};

/**
 * Create a new archetype by cloning another archetype and adding or removing the given
 * component.
 * It will also register itself in the archetype graph and match against world queries.
 * @todo move query matching/global arch pushing in world
 * @param base
 * @param component
 * @param world
 * @returns transformed archetype
 */
export const deriveArchetype = (
  base: Archetype,
  id: ID,
  world: World,
): Archetype => {
  const adjacent = base.edge[id];

  if (adjacent) {
    return adjacent;
  }

  const mask = base.mask.clone();
  mask.xor(id);

  const archetype: Archetype = {
    id: ++nextAid,
    entities: new SparseSet(),
    edge: [],
    mask,
    components: [...base.components, id],
  };

  // Register in archetype graph
  base.edge[id] = archetype;
  archetype.edge[id] = base;

  world.archetypes.push(archetype);
  // @todo is queries.values fast ?
  for (const query of world.queries.values()) {
    if (matchQuery(query, archetype)) {
      query.archetypesSet.insert(archetype.id);
      query.archetypes.push(archetype);
      registerQueryHandlersForArchetype(archetype, query, world);
    }
  }

  return archetype;
};

/**
 * Call the enter and exit handlers of the two given archetypes.
 * @param world
 * @param eid
 * @param archetype
 */
export function onArchetypeChange(
  world: World,
  eid: Entity,
  oldArchetype: Archetype,
  newArchetype: Archetype,
) {
  const exitHandlers = world.handlers.exit[oldArchetype.id];
  const enterHandlers = world.handlers.enter[newArchetype.id];

  if (exitHandlers) {
    for (const fn of exitHandlers) {
      const query = world.queries.get(
        (fn as RegisteredQueryHandler).queryHash,
      )!;
      // avoid calling handlers when we're changing archertype but staying in the same query
      if (!query.archetypesSet.has(newArchetype.id)) {
        fn(eid);
      }
    }
  }

  if (enterHandlers) {
    for (const fn of enterHandlers) {
      const query = world.queries.get(
        (fn as RegisteredQueryHandler).queryHash,
      )!;
      // avoid calling handlers when we're changing archetype but staying in the same query'
      if (!query.archetypesSet.has(oldArchetype.id)) {
        fn(eid);
      }
    }
  }
}
