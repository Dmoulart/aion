import type {World} from "./world.js";
import {buildArchetype} from "./archetype.js";
import {createEntity} from "./entity.js";
import {
  isSingleTypeSchema,
  type Component,
  type ComponentsGroup,
  getComponentID,
} from "./component.js";
import type {InferSchema, Instance} from "./schemas.js";
// @todo: This produces a nested array but we're only interested in the second level. Get rid of this level
export type PrefabOptions<Components extends Component[]> = Map<
  Components,
  ComponentsPrefabFields<Components>
>[0];

export type ComponentsPrefabFields<Comps extends Component[]> = {
  [ID in keyof Comps]: Instance<InferSchema<Comps[ID]>>;
};

// Map function utility
type Map<T, U> = {[K in keyof T]: U};

/**
 * The prefab definition is an object grouping the prefab's specific set of components.
 * @example const definition: PrefabDefinition = { sprite, velocity, health }
 */
export type PrefabDefinition = ComponentsGroup;

/**
 * The prefab instance options is describing the possible parameters for the given prefab definition.
 */
export type PrefabInstanceOptions<Options extends PrefabDefinition> = {
  [ComponentName in keyof Options]?: Partial<
    Instance<InferSchema<Options[ComponentName]>>
  >;
};

/**
 * Creates a factory function to generate entities of a certain type by using
 * objects to initialize its components values.
 * This prefab function version unrolls the assignation loop during runtime to gain some performance.
 *
 * @todo make compiled assignation to speed up
 * @param world
 * @param components
 * @returns entity factory function
 */
export const prefab = <Definition extends PrefabDefinition>(
  world: World,
  definition: Definition,
  defaultProps?: PrefabInstanceOptions<Definition>
) => {
  const components = Object.values(definition);
  const archetype = buildArchetype(components.map(getComponentID), world);

  const assign = defaultProps
    ? compilePrefabWithDefaults(definition, defaultProps)
    : compilePrefab(definition);

  return (options?: PrefabInstanceOptions<Definition>) => {
    const eid = createEntity(world, archetype);

    if (!options) return eid;

    assign(eid, definition, options);

    return eid;
  };
};

export const compilePrefabWithDefaults = <Definition extends PrefabDefinition>(
  definition: Record<string, Component<any>>,
  defaultProps: PrefabInstanceOptions<Definition>
) => {
  const defaultComponentIdentifiers = Object.keys(defaultProps)
    .map((componentName) => {
      return `
      const ${componentName} = definition.${componentName};
      `;
    })
    .join("");

  const unrolledDefaultComponentAssignations = Object.keys(defaultProps)
    .map((componentName) => {
      const componentAssignations = Object.entries(defaultProps[componentName]!)
        .map(([prop, val]) => {
          let componentAssignations;

          if (!isSingleTypeSchema(definition[componentName])) {
            componentAssignations = Object.entries(definition[componentName]!)
              .map(([prop, val]) => {
                if (prop === "data" || prop === "id") return "";
                return `
             options_${componentName}.${prop} && (${componentName}.${prop}[eid] = options_${componentName}.${prop});
          `;
              })
              .join("");
          } else {
            componentAssignations = `
             ${componentName}[eid] = options_${componentName};
          `;
          }
        })
        .join("");

      return componentAssignations;
    })
    .join("");

  const unrolledDefaultLoop = `
    ${defaultComponentIdentifiers}
    ${unrolledDefaultComponentAssignations}
  `;

  return new Function(
    "eid",
    "definition",
    `
      ${unrolledDefaultLoop}
  `
  );
};

const compilePrefab = (definition: Record<string, Component<any>>) => {
  const allComponentIdentifiers = Object.keys(definition)
    .map((componentName) => {
      return `
      const ${componentName} = definition.${componentName};
      `;
    })
    .join("");

  const unrolledInstanceComponentAssignations = Object.keys(definition)
    .map((componentName) => {
      let componentAssignations;

      if (!isSingleTypeSchema(definition[componentName])) {
        componentAssignations = Object.entries(definition[componentName]!)
          .map(([prop, val]) => {
            if (prop === "data" || prop === "id") return "";
            return `
             options_${componentName}.${prop} && (${componentName}.${prop}[eid] = options_${componentName}.${prop});
          `;
          })
          .join("");
      } else {
        componentAssignations = `
             ${componentName}[eid] = options_${componentName};
          `;
      }

      return `
        if(options.${componentName}){
          const options_${componentName} = options.${componentName}
          ${componentAssignations}
        }
      `;
    })
    .join("");

  const unrolledInstanceLoop = `
    ${allComponentIdentifiers}
    ${unrolledInstanceComponentAssignations}
  `;

  return new Function(
    "eid",
    "definition",
    "options",
    `
      ${unrolledInstanceLoop}
  `
  );
};
