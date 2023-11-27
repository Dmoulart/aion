import type {Component, Value} from "./component.js";
import type {ID} from "./entity.js";
import {
  type ArrayType,
  type CustomType,
  type PrimitiveType,
  type Type,
} from "./types.js";

/**
 * All the schemas mapped to their ID
 */
const __SCHEMAS: Record<ID, Schema> = {};

/**
 * Register a specific schema.
 * @param id
 * @param schema
 */
export function setSchema(id: ID, schema: Schema) {
  __SCHEMAS[id] = schema;
}

/**
 * Get a specific schema
 * @param id
 * @returns schema
 */
export function getSchema(id: ID) {
  return __SCHEMAS[id];
}

// The component schema.
// It describes the object passed into the Component factory function.
export type Schema = SingleTypeSchema | MultipleTypesSchema;

export type MultipleTypesSchema = Readonly<{
  [key: string]: Type;
}>;
export type SingleTypeSchema = Type;

// Get the component definition from a component type.
export type InferSchema<C extends Component> = C extends Component<infer Schema>
  ? Schema
  : never;

export type Instance<S extends Schema> = S extends MultipleTypesSchema
  ? {
      [key in keyof S]: S[key] extends infer T
        ? T extends PrimitiveType
          ? Value<T>
          : T extends ArrayType
          ? Value<T>[0]
          : T extends CustomType
          ? Partial<Value<T>>
          : never
        : never;
    }
  : S extends SingleTypeSchema
  ? Value<S>
  : never;
