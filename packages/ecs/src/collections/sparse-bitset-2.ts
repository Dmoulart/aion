import type { AnyBitSet } from "./bit-set.js";
import { SparseSet } from "./sparse-set.js";

export class SparseBitSet2 implements AnyBitSet {
  // With a UInt32 adding (with xor method) 31 will give a negative number which does not work
  // Here I'm maybe missing something
  bits!: Int32Array;
  //@todo there is a maybe a more efficient way to do a sparse bit set.
  set!: SparseSet;
  size!: number;

  constructor(size: number = 1) {
    this.size = size;
    this.bits = new Int32Array(size);
    this.set = new SparseSet();
  }

  /**
   * Check if the bitset contains the given value
   * @param val
   * @returns true if the set has the given value
   */
  has(val: number) {
    const index = val >>> 5;

    if (!this.set.has(index)) {
      return false;
    }

    const setIndex = this.set.sparse[index]!;

    return Boolean(this.bits[setIndex]! & (1 << (val & 31)));
  }

  /**
   * Set the given value.
   * @param val
   */
  or(val: number) {
    const index = val >>> 5;

    if (!this.set.has(index)) {
      this.set.insert(index);
    }

    const setIndex = this.set.sparse[index]!;

    if (setIndex >= this.size) {
      this.#growTo(setIndex + 1);
    }

    this.bits[setIndex] |= 1 << (val & 31);
  }

  /**
   * Set the given value.
   * @param val
   */
  xor(val: number) {
    const index = val >>> 5;

    if (!this.set.has(index)) {
      this.set.insert(index);
    }

    const setIndex = this.set.sparse[index]!;

    if (setIndex >= this.size) {
      this.#growTo(setIndex + 1);
    }

    this.bits[setIndex] ^= 1 << (val & 31);
  }

  /**
   * Returns true if the bitset contains all the values of another bitset
   * @param set
   */
  contains(other: SparseBitSet2) {
    const otherLen = other.set.dense.length;

    if (otherLen === 0 || otherLen > this.set.dense.length) {
      return false;
    }

    for (let i = 0; i < other.set.dense.length; i++) {
      const value = other.set.dense[i]!;

      const indexA = this.set.sparse[value]!;

      const indexB = i;

      if (indexA === undefined) {
        return false;
      }

      const a = this.bits[indexA]!;
      const b = other.bits[indexB]!;

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
  intersects(other: SparseBitSet2) {
    const len = Math.min(this.set.dense.length, other.set.dense.length);

    for (let i = 0; i < len; i++) {
      const value = other.set.dense[i]!;

      const indexA = this.set.sparse[value]!;

      const indexB = i;

      const a = this.bits[indexA]!;
      const b = other.bits[indexB]!;

      if ((a & b) > 0) {
        return true;
      }
    }

    return false;
  }

  clone() {
    const clone = new SparseBitSet2(this.size);
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

    const newMask = new Int32Array(this.size);

    newMask.set(this.bits);

    this.bits = newMask;
  }
}

// const set = new SparseBitSet2();
// set.or(1);
// console.log("add 1", set.bits.length);
// set.or(100_000);
// console.log("add 100_000", set.bits.length);
// console.log("set has one", set.has(1));
// console.log("set has 100_000", set.has(100_000));
// console.log("set1 bits", set.bits, set.set.dense);

// const set2 = new SparseBitSet2();
// set2.or(100_000);
// set2.or(1);
// console.log("set2 bits", set2.bits, set2.set.dense);
// console.log("set2 should intersect", set2.intersects(set));
// console.log("set2 should not contain", set2.contains(set));
