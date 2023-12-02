export class Chunk {
  #buffer!: ArrayBuffer;
  #view!: DataView;
  #offset = 0;

  constructor(buffer: ArrayBuffer) {
    this.#buffer = buffer;
    this.#view = new DataView(buffer);
    this.#view;
  }

  writeUint8(value: number) {
    this.#view.setUint8(this.#offset, value);
    this.#offset += 1;
  }

  writeInt8(value: number) {
    this.#view.setInt8(this.#offset, value);
    this.#offset += 1;
  }

  writeInt16(value: number) {
    this.#view.setInt16(this.#offset, value, true);
    this.#offset += 2;
  }

  writeUint16(value: number) {
    this.#view.setUint16(this.#offset, value, true);
    this.#offset += 2;
  }

  pushInt32(value: number) {
    this.#view.setInt32(this.#offset, value, true);
    this.#offset += 4;
  }

  writeUint32(value: number) {
    this.#view.setUint32(this.#offset, value, true);
    this.#offset += 4;
  }

  writeFloat64(value: number) {
    this.#view.setFloat64(this.#offset, value, true);
    this.#offset += 8;
  }

  writeInt64(value: bigint) {
    this.#view.setBigInt64(this.#offset, value, true);
    this.#offset += 8;
  }

  writeFloat32(value: number) {
    this.#view.setFloat32(this.#offset, value, true);
    this.#offset += 4;
  }

  readUint8(): number {
    const value = this.#view.getUint8(this.#offset);
    this.#offset += 1;
    return value;
  }

  readInt8(): number {
    const value = this.#view.getInt8(this.#offset);
    this.#offset += 1;
    return value;
  }

  readInt16(): number {
    const value = this.#view.getInt16(this.#offset, true);
    this.#offset += 2;
    return value;
  }

  readUint16(): number {
    const value = this.#view.getUint16(this.#offset, true);
    this.#offset += 2;
    return value;
  }

  readFloat32(): number {
    const value = this.#view.getFloat32(this.#offset, true);
    this.#offset += 4;
    return value;
  }

  readUint32(): number {
    const value = this.#view.getUint32(this.#offset, true);
    this.#offset += 4;
    return value;
  }

  readFloat64(): number {
    const value = this.#view.getFloat64(this.#offset, true);
    this.#offset += 8;
    return value;
  }

  readInt64(): BigInt {
    const value = this.#view.getBigInt64(this.#offset, true);
    this.#offset += 8;
    return value;
  }

  get offset() {
    return this.#offset;
  }

  get buffer() {
    return this.#buffer;
  }

  get view() {
    return this.#view;
  }
}
