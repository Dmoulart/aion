import type { ComponentID } from "./component.js";
import { type World } from "./world.js";
import { type Entity, type ID } from "./entity.js";
import { BitSet, SparseSet } from "./collections/index.js";
import { matchQuery, registerQueryHandlersForArchetype } from "./query.js";

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

  // const archComponents = ARCHETYPES_COMPONENTS[base.id]!.clone();
  // archComponents.insert(id);
  // ARCHETYPES_COMPONENTS[archetype.id] = archComponents;

  world.archetypes.push(archetype);
  // @todo is queries.values fast ?
  for (const query of world.queries.values()) {
    if (matchQuery(query, archetype)) {
      query.archetypes.push(archetype);
      registerQueryHandlersForArchetype(archetype, query, world);
    }
  }

  return archetype;
};

/**
 * Call the handlers of a specific archetype on the given entity.
 * @param world
 * @param eid
 * @param archetype
 */
export function onEnterArchetype(
  world: World,
  eid: Entity,
  archetype: Archetype,
) {
  const handlers = world.handlers.enter[archetype.id];
  //@todo handlers for exiting old arch ?
  if (handlers) {
    for (const fn of handlers) {
      fn(eid);
    }
  }
}

/**
 * Call the handlers of a specific archetype on the given entity.
 * @param world
 * @param eid
 * @param archetype
 */
export function onExitArchetype(
  world: World,
  eid: Entity,
  archetype: Archetype,
) {
  //@todo handlers for entering new arch ?
  const handlers = world.handlers.exit[archetype.id];
  if (handlers) {
    for (const fn of handlers) {
      fn(eid);
    }
  }
}
