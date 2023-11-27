import {type Component, getComponentID} from "./component.js";
import type {Entity} from "./entity.js";
import {
  getSchema,
  isPrimitiveType,
  isSingleTypeSchema,
  type MultipleTypesSchema,
} from "./schemas.js";
import {
  f32,
  f64,
  i16,
  i32,
  i64,
  i8,
  u16,
  u64,
  u8,
  type PrimitiveType,
  u32,
} from "./types.js";

export function defineEncoder(...components: Component) {
  for (const component of components) {
    if (isSingleTypeSchema(component)) {
      throw new Error("Single type schema encoding not supported");
    }
  }

  function encode(ents: Entity[], dest: ArrayBuffer) {
    const view = new DataView(dest);
    let offset = 0;

    for (const ent of ents) {
      view.setInt32(offset, ent);
      offset += 4;

      for (const comp of components) {
        const id = getComponentID(comp);
        const Schema = getSchema(id)! as MultipleTypesSchema;

        view.setInt32(offset, id);
        offset += 4;

        for (const field in Schema) {
          const type = Schema[field]!;

          if (!isPrimitiveType(type)) {
            throw new Error("Cannot encode non primitive type");
          }
          //@ts-expect-error
          view[setters[type.name]!](comp[field][ent], type.BYTES_PER_ELEMENT); // (type.BYTES_PER_ELEMENT)
          offset += type.BYTES_PER_ELEMENT;
        }
      }
    }

    return view;
  }

  function decode(dest: ArrayBuffer) {}

  return [encode, decode] as const;
}

const setters = {
  [u8.name]: "setUint8",
  [i8.name]: "setInt8",
  [i16.name]: "setInt16",
  [u16.name]: "setUint16",
  [f32.name]: "setFloat32",
  [u32.name]: "setUint32",
  [i32.name]: "setInt32",
  [u64.name]: "setUint64",
  [i64.name]: "setInt64",
  [f64.name]: "setFloat64",
};

function getSetter(type: PrimitiveType) {}
