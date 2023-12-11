export class Chunk {
  #buffer!: ArrayBuffer;
  #view!: DataView;
  #array!: Uint8Array;
  #offset = 0;

  constructor(buffer: ArrayBuffer) {
    this.#buffer = buffer;
    this.#view = new DataView(buffer);
    this.#array = new Uint8Array(buffer);
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

  writeInt32(value: number) {
    this.#view.setInt32(this.#offset, value, true);
    this.#offset += 4;
  }

  writeUint32(value: number) {
    this.#view.setUint32(this.#offset, value, true);
    this.#offset += 4;
  }

  writeFloat32(value: number) {
    this.#view.setFloat32(this.#offset, value, true);
    this.#offset += 4;
  }

  writeFloat64(value: number) {
    this.#view.setFloat64(this.#offset, value, true);
    this.#offset += 8;
  }

  writeUint64(value: bigint) {
    this.#view.setBigUint64(this.#offset, value, true);
    this.#offset += 8;
  }

  writeInt64(value: bigint) {
    this.#view.setBigInt64(this.#offset, value, true);
    this.#offset += 8;
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

  readInt32(): number {
    const value = this.#view.getUint32(this.#offset, true);
    this.#offset += 4;
    return value;
  }

  readFloat64(): number {
    const value = this.#view.getFloat64(this.#offset, true);
    this.#offset += 8;
    return value;
  }

  readUint64(): BigInt {
    const value = this.#view.getBigUint64(this.#offset, true);
    this.#offset += 8;
    return value;
  }

  readInt64(): BigInt {
    const value = this.#view.getBigInt64(this.#offset, true);
    this.#offset += 8;
    return value;
  }

  #ensureCapacity(newSize: number): void {
    if (this.buffer.byteLength < newSize) {
      const newBuffer = new ArrayBuffer(newSize);
      const newArray = new Uint8Array(newBuffer);
      const newView = new DataView(newBuffer);
      newArray.set(this.#array, 0);
      this.#view = newView;
      this.#buffer = newBuffer;
      this.#array = newArray;
    }
  }

  grow(length: number): void {
    if (length > this.buffer.byteLength) {
      this.#ensureCapacity(length);
    }
  }

  ensureAvailableCapacity(capacity: number): void {
    const available = this.buffer.byteLength - this.#offset;
    if (available < capacity) {
      this.#ensureCapacity(this.buffer.byteLength + capacity);
    }
  }
}
