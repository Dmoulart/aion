import type {ArrayType, InferArrayType, PrimitiveType, Type} from "./types.js";
import type {World} from "./world.js";
import {type ID, NonExistantEntity} from "./entity.js";
import {deriveArchetype} from "./archetype.js";
import {type Entity} from "./entity.js";
import {nextID} from "./id.js";
import {type Schema, __SCHEMAS} from "./schemas.js";

export type ComponentId<S extends Schema = Schema> = ID & {__brand: S};

export type InferSchemaFromID<ID extends ComponentId> = ID extends ComponentId<
  infer Schema
>
  ? Schema
  : never;

export type Component<S extends Schema = any> = {
  id: ComponentId<S>;
} & Columns<S>;

export type ComponentFromID<ID extends ComponentId> = Component<
  InferSchemaFromID<ID>
>;

export type Columns<S extends Schema> = {
  [column in keyof S]: Column<S[column]>;
};

// A component field is a typed array or an array of typed array.
export type Column<T extends Type> = T extends PrimitiveType
  ? InstanceType<T>
  : T extends ArrayType
  ? Array<InstanceType<InferArrayType<T>>>
  : never;

export type Value<T extends Type> = T extends PrimitiveType
  ? number
  : T extends ArrayType
  ? Array<number>
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
  const comp = {} as Columns<S>;

  for (const field of Object.keys(schema) as Array<keyof S>) {
    const type = schema[field];

    if (isArrayType(type)) {
      const [TypedArray, arraySize] = type;

      comp[field] = new Array(size).fill(undefined).map(() => {
        //@todo shared array buffer
        return new TypedArray(arraySize);
      }) as Column<S[keyof S]>;
    }
    // If key is an array constructor let's initialize it with the world size
    else if (isPrimitiveType(type)) {
      const buffer = new ArrayBuffer(size * type.BYTES_PER_ELEMENT);
      comp[field] = new type(buffer) as Column<S[keyof S]>;
    } else {
      throw new Error("Custom type not implemented");
    }
  }

  return comp;
};

const isArrayType = (field: unknown): field is ArrayType => {
  return Array.isArray(field);
};

const isPrimitiveType = (field: unknown): field is PrimitiveType => {
  return typeof field === "function" && field !== Array;
};

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
  const componentID = (id ?? nextID()) as ComponentId<S>;

  __SCHEMAS[componentID] = schema;

  const storage = createComponentColumns(schema, size) as Component<
    typeof schema
  >;

  storage.id = componentID;

  return storage;
};

// @todo more precise type guard
export const isComponent = (obj: object): obj is Component => "id" in obj;

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
  eid: Entity
) {
  const archetype = world.entitiesArchetypes[eid]!;

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to add component to a non existant entity with id : ${eid}`
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent.id : idOrComponent;

  if (archetype.mask.has(id)) return;

  const newArchetype = deriveArchetype(archetype, id, world);

  archetype.entities.remove(eid);
  newArchetype.entities.insert(eid);

  const handlers = world.handlers.enter[newArchetype.id];
  //@todo handlers for exiting old arch ?
  if (handlers) {
    for (const fn of handlers) {
      fn(eid);
    }
  }

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
  eid: Entity
): void {
  const archetype = world.entitiesArchetypes[eid];

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to remove component from a non existant entity with id :${eid}`
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent.id : idOrComponent;

  if (!archetype.mask.has(id)) return;

  const newArchetype = deriveArchetype(archetype, id, world);

  archetype.entities.remove(eid);
  newArchetype.entities.insert(eid);

  console.log("handler", world.handlers.exit[archetype.id]);

  //@todo handlers for entering new arch ?
  const handlers = world.handlers.exit[archetype.id];
  if (handlers) {
    for (const fn of handlers) {
      fn(eid);
    }
  }

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
  eid: Entity
): boolean;
export function hasComponent(
  world: World,
  component: Component,
  eid: Entity
): boolean;
export function hasComponent(
  world: World,
  idOrComponent: ID | ComponentId | Component,
  eid: Entity
): boolean {
  const archetype = world.entitiesArchetypes[eid];

  if (!archetype) {
    throw new NonExistantEntity(
      `Trying to check component existence of a non existant entity with id : ${eid}`
    );
  }

  const id =
    typeof idOrComponent === "object" ? idOrComponent.id : idOrComponent;

  return archetype.mask.has(id);
}

// export function set<C extends ComponentId>(
//   world: World,
//   comp: C,
//   eid: Entity,
//   data: Instance<InferSchemaFromID<C>>
// ) {
//   const storage = storageOf(world, comp);
//   for (const field in data) {
//     storage[field][eid] = data[field];
//   }
// }

// export function storageOf<C extends ComponentId>(
//   world: World,
//   compID: C
// ): Component<InferSchemaFromID<C>> {
//   const storage = world.storage[compID];

//   if (!storage) {
//     return initComponentStorage(compID, world);
//   }

//   return storage;
// }

// export function initComponentStorage<C extends ComponentId>(
//   compID: C,
//   world: World
// ): Component<InferSchemaFromID<C>> {
//   const schema = __SCHEMAS[compID];

//   if (!schema) {
//     throw new Error("");
//   }

//   const storage = createComponentColumns(schema, world.size) as Component<
//     typeof schema
//   >;

//   storage.id = compID;
//   world.storage[compID] = storage;

//   return storage as any;
// }

// export function get<C extends ComponentId>(
//   world: World,
//   comp: C,
//   eid: Entity,
//   dest: any = {}
// ): Instance<InferSchemaFromID<C>> {
//   const storage = storageOf(world, comp);
//   const obj = dest;
//   for (const field in storage) {
//     if (field === "id") continue; // @todo remove this
//     obj[field] = storage[field][eid];
//   }
//   return obj;
// }

// const Position = defineComponent({
//   x: f32,
//   y: f32,
// });

// const Velocity = defineComponent({
//   x: f32,
//   y: f32,
// });

// const world = createWorld();

// const actor = prefab(world, {Position, Velocity});

// const ent = actor({
//   Position: {
//     x: 10,
//     y: 10,
//   },
//   Velocity: {
//     x: 20,
//     y: 20,
//   },
// });

// const positions = storageOf(Position, world);
// const velocity = storageOf(Position, world);

// console.log(
//   positions.x[ent],
//   positions.y[ent],
//   velocity.x[ent],
//   velocity.y[ent]
// );
