import type {Component, Value} from "./component.js";
import type {ID} from "./entity.js";
import {type ArrayType, type PrimitiveType, type Type} from "./types.js";

/**
 * All the schemas mapped to their ID
 */
export const __SCHEMAS: Record<ID, Schema> = {};

// The component schema.
// It describes the object passed into the Component factory function.
export type Schema = Readonly<{
  [key: string]: Type;
}>;

// Get the component definition from a component type.
export type InferSchema<C extends Component> = C extends Component<infer Schema>
  ? Schema
  : never;

export type Instance<S extends Schema> = {
  [key in keyof S]: S[key] extends infer T
    ? T extends PrimitiveType
      ? Value<T>
      : T extends ArrayType
      ? Value<T>[0]
      : never
    : never;
};
