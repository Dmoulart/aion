import {
  type ArrayType,
  type CustomType,
  type InferArrayType,
  type PrimitiveType,
  type Type,
} from "./types.js";
import type { World } from "./world.js";
import { type ID, NonExistantEntity } from "./entity.js";
import { deriveArchetype, onArchetypeChange } from "./archetype.js";
import { type Entity } from "./entity.js";
import { getBaseID, getID, getRelationID, isRelation, nextID } from "./id.js";
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
import { type Relation } from "./relation.js";

export type ComponentID<S extends Schema = Schema> = ID & { __brand: S };

export const $cid: unique symbol = Symbol("$cid");

export type InferSchemaFromID<ID extends ComponentID> = ID extends ComponentID<
  infer Schema
>
  ? Schema
  : never;

export type Component<S extends Schema = Schema> = {
  [$cid]: ComponentID<S>;
} & Columns<S>;

export type ComponentFromID<ID extends ComponentID> = Component<
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
  ? InstanceType<InferArrayType<T>>
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
  size: number
): Columns<S> => {
  if (isSingleTypeSchema(schema)) {
    return createColumn(schema, size) as any;
  }
  const comp = {} as Columns<S>;

  for (const field of Object.keys(schema)) {
    const type = schema[field]!;
    (comp as any)[field] = createColumn(type, size);
  }

  return comp;
};

function createColumn(
  type: SingleTypeSchema | MultipleTypesSchema[keyof MultipleTypesSchema],
  size: number
) {
  if (isArrayType(type)) {
    const [TypedArray, arraySize] = type;

    return new Array(size).fill(undefined).map(() => {
      //@todo shared array buffer ?
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
  id?: number
): Component<S> => {
  const componentID = (id ?? nextID()) as ComponentID<S>;

  setSchema(componentID, schema);

  const component = createComponentColumns(schema, size) as Component<
    typeof schema
  >;

  component[$cid] = componentID;

  components[componentID] = component;

  return component;
};

export const isComponent = (value: unknown): value is Component =>
  !!value && typeof value === "object" && $cid in value;

export const getComponentID = (component: Component) => component[$cid];
export const getComponentByID = (id: ComponentID) => components[id];

/**
 * Add a component to the given entity.
 * @param world
 * @param component
 * @param eid
 * @throws {NonExistantEntity}
 * @returns nothing
 */
export function attach(world: World, id: Entity, eid: Entity): void;
export function attach(world: World, id: ComponentID, eid: Entity): void;
export function attach(world: World, component: Component, eid: Entity): void;
export function attach(
  world: World,
  idOrComponent: ID | Component,
  eid: Entity
) {
  const oldArchetype = world.entitiesArchetypes[eid]!;

  if (!oldArchetype) {
    throw new NonExistantEntity(
      `Trying to add component to a non existant entity with id : ${eid}`
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent[$cid] : idOrComponent;

  if (oldArchetype.mask.has(id)) return;

  ON_BEFORE_ADD_COMPONENT[getBaseID(id)]?.(id, eid, world);

  const newArchetype = deriveArchetype(oldArchetype, id, world);

  oldArchetype.entities.remove(eid);
  newArchetype.entities.insert(eid);

  world.entitiesArchetypes[eid] = newArchetype;

  onArchetypeChange(world, eid, oldArchetype, newArchetype);
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
export function detach(world: World, id: ComponentID, eid: Entity): void;
export function detach(world: World, component: Component, eid: Entity): void;
export function detach(
  world: World,
  idOrComponent: ID | Component,
  eid: Entity
): void {
  const oldArchetype = world.entitiesArchetypes[eid];

  if (!oldArchetype) {
    throw new NonExistantEntity(
      `Trying to remove component from a non existant entity with id :${eid}`
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent[$cid] : idOrComponent;

  if (!oldArchetype.mask.has(id)) return;

  ON_BEFORE_REMOVE_COMPONENT[getBaseID(id)]?.(id, eid, world);

  const newArchetype = deriveArchetype(oldArchetype, id, world);

  oldArchetype.entities.remove(eid);
  newArchetype.entities.insert(eid);

  world.entitiesArchetypes[eid] = newArchetype;

  onArchetypeChange(world, eid, oldArchetype, newArchetype);
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
  id: ComponentID,
  eid: Entity
): boolean;
export function hasComponent(
  world: World,
  component: Component,
  eid: Entity
): boolean;
export function hasComponent(
  world: World,
  idOrComponent: ID | ComponentID | Component,
  eid: Entity
): boolean {
  const archetype = world.entitiesArchetypes[eid];

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to check component existence of a non existant entity with id : ${eid}`
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent[$cid] : idOrComponent;

  return archetype.mask.has(id);
}

export function getEntityComponents(world: World, entity: Entity): ID[] {
  const archetype = world.entitiesArchetypes[entity];

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to get entity components from a non existant entity : ${entity}`
    );
  }

  return archetype.components as ID[];
}

type OnBeforeAddComponentCallback = (
  id: ID,
  entity: Entity,
  world: World
) => void;

const ON_BEFORE_ADD_COMPONENT: OnBeforeAddComponentCallback[] = [];

export function onBeforeAddComponent(
  component: Component | ID | Relation,
  cb: OnBeforeAddComponentCallback
) {
  ON_BEFORE_ADD_COMPONENT[getID(component)] = cb;
}

type OnBeforeRemoveComponentCallback = (
  id: ID,
  entity: Entity,
  world: World
) => void;

const ON_BEFORE_REMOVE_COMPONENT: OnBeforeRemoveComponentCallback[] = [];

export function onBeforeRemoveComponent(
  component: Component | ID | Relation,
  cb: OnBeforeAddComponentCallback
) {
  ON_BEFORE_REMOVE_COMPONENT[getID(component)] = cb;
}
