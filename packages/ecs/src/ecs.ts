import {
  hasComponent,
  attach,
  detach,
  type Component,
  type ComponentsGroup,
} from "./component.js";
import {
  type World,
  createWorld,
  createEntity,
  removeEntity,
  entityExists,
  type ID,
} from "./index.js";
import {
  prefab,
  type PrefabDefinition,
  type PrefabInstanceOptions,
} from "./prefab.js";
import {
  query,
  type QueryTerm,
  type Query,
  all,
  any,
  none,
  not,
} from "./query.js";

export const createECS = (world: World = createWorld()) => {
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
    query: query.bind(null, world) as <
      T extends (QueryTerm | Component | ComponentsGroup | ID)[]
    >(
      ...termsOrComponents: T
    ) => Query,
    all,
    any,
    none,
    not,
  };
};
