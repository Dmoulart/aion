import {buildArchetype, type Archetype} from "./archetype.js";
import {Chunk} from "./chunk.js";
import {
  type Component,
  attach,
  getComponentByID,
  type ComponentId,
  getComponentID,
  $cid,
} from "./component.js";
import {insertEntity, type Entity} from "./entity.js";
import {
  getSchema,
  isPrimitiveType,
  isSingleTypeSchema,
  type MultipleTypesSchema,
  type Schema,
} from "./schemas.js";
import {f32, f64, i16, i32, i64, i8, u16, u64, u8, u32} from "./types.js";
import type {World} from "./world.js";

export type EncoderConfig = {
  decodingStrategy: (world: World, eid: Entity, arch: Archetype) => Entity;
};

const DEFAULT_ENCODER_CONFIG: EncoderConfig = {
  decodingStrategy: replace,
};

function replace(world: World, eid: Entity, archetype: Archetype) {
  return insertEntity(world, eid, archetype);
}

/**
 * Define a encoding and decoding function for a group of components.
 * @todo perf
 * @param components
 * @param options
 * @returns
 */
export function defineEncoder(
  components: Component[],
  {decodingStrategy} = DEFAULT_ENCODER_CONFIG
) {
  for (const comp of components) {
    const schema = getSchema(getComponentID(comp))!;

    if (isSingleTypeSchema(schema)) {
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

  function encode(ents: Entity[], chunk: Chunk) {
    const len = ents.length * instanceSize + 4;
    chunk.ensureAvailableCapacity(len);
    // write len
    chunk.writeUint32(len);

    for (const ent of ents) {
      chunk.writeInt32(ent);

      for (const comp of components) {
        const id = getComponentID(comp);
        const Schema = getSchema(id)! as MultipleTypesSchema;

        chunk.writeInt32(id);

        for (const field in Schema) {
          const type = Schema[field]!;

          if (!isPrimitiveType(type)) {
            throw new Error("Cannot encode non primitive type");
          }

          const value = comp[field as keyof Schema][ent];

          chunk[setters[type.name]!](value);
        }
      }
    }
    return chunk;
  }

  function decode(world: World, chunk: Chunk) {
    const archetype = buildArchetype(components.map(getComponentID), world);

    const startOffset = chunk.offset;
    const len = chunk.readUint32();

    while (chunk.offset < startOffset + len) {
      const ent = chunk.readInt32();

      for (const _ of components) {
        const id = chunk.readInt32();

        const Schema = getSchema(id)! as MultipleTypesSchema;
        for (const field in Schema) {
          const type = Schema[field]!;

          if (!isPrimitiveType(type)) {
            throw new Error("Cannot decode non primitive type");
          }

          const comp = getComponentByID(
            id as ComponentId
          )! as Component<MultipleTypesSchema>;

          const value = chunk[getters[type.name]!]();

          comp[field]![ent] = value;
        }
      }

      decodingStrategy(world, ent, archetype);
    }

    return chunk;
  }

  return [encode, decode] as const;
}

function getComponentByteSize(comp: Component) {
  let size = 0;
  const id = getComponentID(comp);
  const schema = getSchema(id)!;

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
} as const;

const getters = {
  [u8.name]: "readUint8",
  [i8.name]: "readInt8",
  [i16.name]: "readInt16",
  [u16.name]: "readUint16",
  [f32.name]: "readFloat32",
  [u32.name]: "readUint32",
  [i32.name]: "readInt32",
  [u64.name]: "readUint64",
  [i64.name]: "readInt64",
  [f64.name]: "readFloat64",
} as const;
