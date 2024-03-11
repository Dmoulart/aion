import {
  type ArrayType,
  type CustomType,
  type InferArrayType,
  type PrimitiveType,
  type Type,
} from "./types.js";
import type { World } from "./world.js";
import { type ID, NonExistantEntity } from "./entity.js";
import { deriveArchetype, type Archetype } from "./archetype.js";
import { type Entity } from "./entity.js";
import { nextID } from "./id.js";
import {
  type Schema,
  type MultipleTypesSchema,
  type SingleTypeSchema,
  setSchema,
  isArrayType,
  isCustomType,
  isPrimitiveType,
  isSingleTypeSchema,
} from "./schemas.js";

export type ComponentId<S extends Schema = Schema> = ID & { __brand: S };

export const $cid: unique symbol = Symbol("$cid");

export type InferSchemaFromID<ID extends ComponentId> =
  ID extends ComponentId<infer Schema> ? Schema : never;

export type Component<S extends Schema = Schema> = {
  [$cid]: ComponentId<S>;
} & Columns<S>;

export type ComponentFromID<ID extends ComponentId> = Component<
  InferSchemaFromID<ID>
>;

//@todo name
export type ComponentsGroup = Readonly<{
  [key: string]: Component;
}>;

export type Columns<S extends Schema> = S extends MultipleTypesSchema
  ? {
      [column in keyof S]: Column<S[column]>;
    }
  : S extends SingleTypeSchema
    ? Column<S>
    : never;

// A component field is a typed array or an array of typed array.
export type Column<T extends Type> = T extends PrimitiveType
  ? InstanceType<T>
  : T extends ArrayType
    ? Array<InstanceType<InferArrayType<T>>>
    : T extends CustomType
      ? ReturnType<T>
      : never;

export type Value<T extends Type> = T extends PrimitiveType
  ? number
  : T extends ArrayType
    ? Array<number>
    : T extends CustomType
      ? ReturnType<T>[number]
      : never;

/**
 * Create a component store from a component definition.
 * @param def
 * @param size
 * @returns component
 */
const createComponentColumns = <S extends Schema>(
  schema: S,
  size: number,
): Columns<S> => {
  if (isSingleTypeSchema(schema)) {
    return createColumn(schema, size) as any;
  }
  const comp = {} as Columns<S>;

  for (const field of Object.keys(schema) as Array<keyof S>) {
    const type = schema[field]! as Type;
    (comp as any)[field] = createColumn(type, size);
  }

  return comp;
};

function createColumn(
  type: SingleTypeSchema | MultipleTypesSchema[keyof MultipleTypesSchema],
  size: number,
) {
  if (isArrayType(type)) {
    const [TypedArray, arraySize] = type;

    return new Array(size).fill(undefined).map(() => {
      //@todo shared array buffer
      return new TypedArray(arraySize);
    });
  }
  // If key is an array constructor let's initialize it with the world size
  else if (isPrimitiveType(type)) {
    const buffer = new ArrayBuffer(size * type.BYTES_PER_ELEMENT);
    return new type(buffer);
  } else if (isCustomType(type)) {
    return type(size);
  } else {
    throw new Error("Unknown field type");
  }
}

// All the components indexed by ID.
export const components: Component[] = [];

/**
 * Create a new component from a component definition.
 * @param def component definition
 * @param size the size of the component store. It should equal to the size of the world.
 * @returns component
 */
export const defineComponent = <S extends Schema>(
  schema: S,
  size = 10_000,
  id?: number,
): Component<S> => {
  const componentID = (id ?? nextID()) as ComponentId<S>;

  setSchema(componentID, schema);

  const component = createComponentColumns(schema, size) as Component<
    typeof schema
  >;

  component[$cid] = componentID;

  components[componentID] = component;

  return component;
};

export const isComponent = (obj: object): obj is Component => $cid in obj;

export const getComponentID = (component: Component) => component[$cid];
export const getComponentByID = (id: ComponentId) => components[id];

/**
 * Add a component to the given entity.
 * @param world
 * @param component
 * @param eid
 * @throws {NonExistantEntity}
 * @returns nothing
 */
export function attach(world: World, id: Entity, eid: Entity): void;
export function attach(world: World, id: ComponentId, eid: Entity): void;
export function attach(world: World, component: Component, eid: Entity): void;
export function attach(
  world: World,
  idOrComponent: ID | Component,
  eid: Entity,
) {
  const archetype = world.entitiesArchetypes[eid]!;

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to add component to a non existant entity with id : ${eid}`,
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent[$cid] : idOrComponent;

  if (archetype.mask.has(id)) return;

  const newArchetype = deriveArchetype(archetype, id, world);

  archetype.entities.remove(eid);
  newArchetype.entities.insert(eid);

  onEnterArchetype(world, eid, newArchetype);

  world.entitiesArchetypes[eid] = newArchetype;
}

/**
 * Remove a component from the given entity.
 * @param world
 * @param component
 * @param eid
 * @throws {NonExistantEntity}
 * @returns nothing
 */
export function detach(world: World, id: Entity, eid: Entity): void;
export function detach(world: World, id: ComponentId, eid: Entity): void;
export function detach(world: World, component: Component, eid: Entity): void;
export function detach(
  world: World,
  idOrComponent: ID | Component,
  eid: Entity,
): void {
  const archetype = world.entitiesArchetypes[eid];

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to remove component from a non existant entity with id :${eid}`,
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent[$cid] : idOrComponent;

  if (!archetype.mask.has(id)) return;

  const newArchetype = deriveArchetype(archetype, id, world);

  archetype.entities.remove(eid);
  newArchetype.entities.insert(eid);

  onExitArchetype(world, eid, archetype);

  world.entitiesArchetypes[eid] = newArchetype;
}

/**
 * Returns true if the entity possess the specified component.
 * @param comp
 * @param world
 * @param eid
 * @throws {NonExistantEntity}
 * @returns entity has the specified component
 */
export function hasComponent(world: World, id: Entity, eid: Entity): boolean;
export function hasComponent(
  world: World,
  id: ComponentId,
  eid: Entity,
): boolean;
export function hasComponent(
  world: World,
  component: Component,
  eid: Entity,
): boolean;
export function hasComponent(
  world: World,
  idOrComponent: ID | ComponentId | Component,
  eid: Entity,
): boolean {
  const archetype = world.entitiesArchetypes[eid];

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to check component existence of a non existant entity with id : ${eid}`,
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent[$cid] : idOrComponent;

  return archetype.mask.has(id);
}

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
