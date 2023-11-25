import type {ComponentId} from "./component.js";
import {type World} from "./world.js";
import {type ID} from "./entity.js";
import {BitSet, SparseSet} from "./collections/index.js";
import {matchQuery, registerQueryHandlersForArchetype} from "./query.js";

export type Archetype = {
  /**
   * The archetype id.
   */
  id: number;
  /**
   * The set of entities belonging to this archetype
   */
  entities: SparseSet;
  /**
   * The adjacent archertypes in the archetype graph
   */
  edge: (Archetype | undefined)[];
  /**
   * The archetype mask based on the components ids
   */
  mask: BitSet;
};

// The next archetype id.
let nextAid = 0;

/**
 * Creates a new archetype with the specified list of components.
 * @param mask
 * @returns new archetype
 */
export const createArchetype = (mask = new BitSet(2)): Archetype => {
  return {
    id: ++nextAid,
    entities: new SparseSet(),
    edge: [],
    mask,
  };
};

/**
 * Composes an archetype from an array of components.
 * It will also register all the intermediate archetypes in the world archetype graph.
 * @param components
 * @param world
 */
export const buildArchetype = (
  components: ComponentId<any>[],
  world: World
) => {
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
  world: World
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
  };

  // Register in archetype graph
  base.edge[id] = archetype;
  archetype.edge[id] = base;

  world.archetypes.push(archetype);

  for (const query of world.queries.values()) {
    if (matchQuery(query, archetype)) {
      query.archetypes.push(archetype);
      registerQueryHandlersForArchetype(archetype, query, world);
    }
  }

  return archetype;
};
