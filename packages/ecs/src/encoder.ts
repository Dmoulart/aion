import {Chunk} from "./chunk.js";
import {
  type Component,
  attach,
  getComponentByID,
  type ComponentId,
} from "./component.js";
import {insertEntity, type Entity} from "./entity.js";
import {
  getSchema,
  isPrimitiveType,
  isSingleTypeSchema,
  type MultipleTypesSchema,
} from "./schemas.js";
import {f32, f64, i16, i32, i64, i8, u16, u64, u8, u32} from "./types.js";
import type {World} from "./world.js";

export type EncoderConfig = {
  decodingStrategy: (world: World, eid: Entity) => Entity;
};

const DEFAULT_ENCODER_CONFIG: EncoderConfig = {
  decodingStrategy: replace,
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
  {decodingStrategy} = DEFAULT_ENCODER_CONFIG
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
    chunk: Chunk = new Chunk(new ArrayBuffer(ents.length * instanceSize + 4))
  ) {
    const len = ents.length * instanceSize + 4;
    chunk.grow(len);
    // write len
    chunk.writeUint32(len);

    for (const ent of ents) {
      chunk.writeInt32(ent);

      for (const comp of components) {
        //@todo fix component id getting
        const id = comp.__id;
        const Schema = getSchema(id)! as MultipleTypesSchema;

        chunk.writeInt32(id);

        for (const field in Schema) {
          const type = Schema[field]!;

          if (!isPrimitiveType(type)) {
            throw new Error("Cannot encode non primitive type");
          }
          //@ts-expect-error
          chunk[setters[type.name]!](comp[field][ent]);
        }
      }
    }
    return chunk;
  }

  function decode(world: World, chunk: Chunk) {
    const len = chunk.readUint32();

    while (chunk.offset < len) {
      const ent = chunk.readInt32();

      decodingStrategy(world, ent);

      for (let i = 0; i < components.length; i++) {
        const compID = chunk.readInt32();

        const Schema = getSchema(compID)! as MultipleTypesSchema;

        for (const field in Schema) {
          const type = Schema[field]!;

          if (!isPrimitiveType(type)) {
            throw new Error("Cannot encode non primitive type");
          }

          attach(world, compID, ent);

          //@ts-expect-error
          const val = chunk[getters[type.name]!]();

          const comp = getComponentByID(compID as ComponentId);
          comp[field][ent] = val;
        }
      }
    }

    return chunk;
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
  [u8.name]: "writeUint8",
  [i8.name]: "writeInt8",
  [i16.name]: "writeInt16",
  [u16.name]: "writeUint16",
  [f32.name]: "writeFloat32",
  [u32.name]: "writeUint32",
  [i32.name]: "writeInt32",
  [u64.name]: "writeUint64",
  [i64.name]: "writeInt64",
  [f64.name]: "writeFloat64",
};

const getters = {
  [u8.name]: "readUint8",
  [i8.name]: "readInt8",
  [i16.name]: "readInt16",
  [u16.name]: "readUint16",
  [f32.name]: "readFloat32",
  [u32.name]: "readUint32",
  [i32.name]: "readInt32",
  [u64.name]: "readtUint64",
  [i64.name]: "readInt64",
  [f64.name]: "readFloat64",
};
