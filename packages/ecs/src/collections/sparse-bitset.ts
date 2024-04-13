import type { AnyBitSet } from "./bit-set.js";
import { SparseSet } from "./sparse-set.js";

export class SparseBitSet implements AnyBitSet {
  bits!: Uint32Array;
  //@todo there is a maybe a more efficient way to do a sparse bit set.
  set!: SparseSet;
  size!: number;

  constructor(size: number = 10) {
    this.size = size;
    this.bits = new Uint32Array(size);
    this.set = new SparseSet();
  }

  /**
   * Check if the bitset contains the given value
   * @param val
   * @returns true if the set has the given value
   */
  has(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      return false;
    }

    return Boolean(this.bits[index]! & (1 << (val & 31)));
  }

  /**
   * Set the given value.
   * @param val
   */
  or(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.#growTo(index + 1);
    }

    if (!this.set.has(index)) {
      this.set.insert(index);
    }

    this.bits[index] |= 1 << (val & 31);
  }

  /**
   * Set the given value.
   * @param val
   */
  xor(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.#growTo(index + 1);
    }

    if (!this.set.has(index)) {
      this.set.insert(index);
    }

    this.bits[index] ^= 1 << (val & 31);
  }

  /**
   * Returns true if the bitset contains all the values of another bitset
   * @param set
   */
  contains(other: SparseBitSet) {
    const otherLen = other.indexes.length;

    if (otherLen > this.indexes.length) {
      return false;
    }

    for (let i = 0; i < otherLen; i++) {
      const offset = other.indexes[i]!;

      const b = other.bits[offset]!;
      const a = this.bits[offset]!;

      if ((a & b) !== b) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns true if the bitset contains any value of another bitset
   * @param set
   */
  intersects(other: SparseBitSet) {
    const len = Math.min(this.indexes.length, other.indexes.length);

    for (let i = 0; i < len; i++) {
      const offset = other.indexes[i]!;

      const a = this.bits[offset]!;
      const b = other.bits[offset]!;

      if ((a & b) > 0) {
        return true;
      }
    }
    return false;
  }

  clone() {
    const clone = new SparseBitSet(this.size);
    clone.set = this.set.clone();
    clone.bits.set(this.bits);
    return clone;
  }

  get indexes() {
    return this.set.dense;
  }

  #growTo(newSize: number) {
    const diff = newSize - this.size;

    this.size += diff;

    const newMask = new Uint32Array(this.size);

    newMask.set(this.bits);

    this.bits = newMask;
  }
}
