import {
  type Component,
  attach,
  getComponentByID,
  type ComponentId,
} from "./component.js";
import {createEntity, insertEntity, type Entity} from "./entity.js";
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
import type {World} from "./world.js";

export type EncoderConfig = {
  decodeEntity: (world: World, eid: Entity) => Entity;
};

const DEFAULT_ENCODER_CONFIG: EncoderConfig = {
  decodeEntity: replace,
};

function replace(world: World, eid: Entity) {
  return insertEntity(world, eid);
}

/**
 * Define a encoding and decoding function for a group of components.
 * @todo perf
 * @param components
 * @param param1
 * @returns
 */
export function defineEncoder(
  components: Component[],
  {decodeEntity} = DEFAULT_ENCODER_CONFIG
) {
  for (const component of components) {
    if (isSingleTypeSchema(component)) {
      throw new Error("Single type schema encoding not supported");
    }
  }

  const componentsInstanceSize = components.reduce(
    (prev, curr) => prev + getComponentByteSize(curr),
    0
  );

  const entitySize = 4;

  const componentsHeaderSize = 4 * components.length;

  const instanceSize =
    componentsInstanceSize + componentsHeaderSize + entitySize;

  function encode(
    ents: Entity[],
    dest: ArrayBuffer = new ArrayBuffer(ents.length * instanceSize)
  ) {
    const view = new DataView(dest);
    let offset = 0;

    for (const ent of ents) {
      view.setInt32(offset, ent, true);
      offset += 4;

      for (const comp of components) {
        const id = comp.__id;
        const Schema = getSchema(id)! as MultipleTypesSchema;

        view.setInt32(offset, id, true);
        offset += 4;
        for (const field in Schema) {
          const type = Schema[field]!;

          if (!isPrimitiveType(type)) {
            throw new Error("Cannot encode non primitive type");
          }
          //@ts-expect-error
          view[setters[type.name]!](offset, comp[field][ent], true);
          offset += type.BYTES_PER_ELEMENT;
        }
      }
    }

    return view.buffer;
  }

  function decode(world: World, data: ArrayBuffer) {
    const view = new DataView(data);
    let offset = 0;

    while (offset < view.byteLength) {
      const ent = view.getInt32(offset, true);
      offset += 4;

      decodeEntity(world, ent);

      for (let i = 0; i < components.length; i++) {
        const compID = view.getInt32(offset, true);
        offset += 4;

        const Schema = getSchema(compID)! as MultipleTypesSchema;

        for (const field in Schema) {
          const type = Schema[field]!;

          if (!isPrimitiveType(type)) {
            throw new Error("Cannot encode non primitive type");
          }

          attach(world, compID, ent);

          //@ts-expect-error
          const val = view[getters[type.name]!](offset, true);
          offset += type.BYTES_PER_ELEMENT;

          const comp = getComponentByID(compID as ComponentId);
          comp[field][ent] = val;
        }
      }
    }
  }

  return [encode, decode] as const;
}

function getComponentByteSize(comp: Component) {
  let size = 0;
  const schema = getSchema(comp.__id)!;

  if (isSingleTypeSchema(schema)) {
    throw new Error("Cannot encode single type schema");
  }

  for (const field in schema) {
    const type = schema[field]!;
    if (!isPrimitiveType(type)) {
      throw new Error("Cannot encode non primitive type");
    }
    size += type.BYTES_PER_ELEMENT;
  }

  return size;
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

const getters = {
  [u8.name]: "getUint8",
  [i8.name]: "getInt8",
  [i16.name]: "getInt16",
  [u16.name]: "getUint16",
  [f32.name]: "getFloat32",
  [u32.name]: "getUint32",
  [i32.name]: "getInt32",
  [u64.name]: "getUint64",
  [i64.name]: "getInt64",
  [f64.name]: "getFloat64",
};
