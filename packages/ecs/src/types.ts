import {aion} from "./world.js";

export const i8 = Int8Array;
export const u8 = Uint8Array;

export const i16 = Int16Array;
export const u16 = Uint16Array;

export const i32 = Int32Array;
export const ui32 = Uint32Array;

export const f32 = Float32Array;
export const f64 = Float64Array;

export const i64 = BigInt64Array;
export const u64 = BigUint64Array;

export const eid = Uint32Array;

/**
 * The possible types for components entries.
 */
export const types = {
  i8,
  u8,
  i16,
  u16,
  i32,
  ui32,
  f32,
  f64,
  i64,
  u64,
  eid,
} as const;

// The JS typed arrays types we'll use as component fields definitions
export type Types = typeof types;

export type PrimitiveType = Types[keyof Types];

// The nested arrays fields will be defined like in bitECS : a typed array constructor and the length of the array
export type ArrayType<T extends PrimitiveType = PrimitiveType> = [T, number];

export type CustomType<T = any> = ArrayLike<T>;

export type InferArrayType<T extends ArrayType> = T extends ArrayType<infer El>
  ? El
  : never;

export type Type = PrimitiveType | ArrayType | CustomType;

// const {create, attach, remove, has, exists, prefab, query} = aion();

// const e = create();
// attach(e, e);
// console.log("exists", exists(e));
// console.log("has", has(e, e));
// console.log("remove");
// remove(e);
// console.log("exists", exists(e));

// const pos = defineComponent({
//   x: i32,
//   y: i32,
// });

// const Actor = prefab({ pos });

// query(any(pos)).each(e => {

// })
