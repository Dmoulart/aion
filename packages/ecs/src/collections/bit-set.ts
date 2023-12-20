export interface BitsetInterface {
  /**
   * The bitset mask
   */
  mask: Uint32Array;
  /**
   * Check if the bitset contains the given value
   * @param val
   * @returns true if the set has the given value
   */
  has: (val: number) => boolean;
  /**
   * Set the given value.
   * @param val
   * @returns nothing
   */
  or: (val: number) => void;
  /**
   * Unset the given value
   * @param val
   * @returns nothing
   */
  xor: (val: number) => void;
  /**
   * Returns true if the bitset contains all the values of another bitset
   * @param set
   * @returns
   */
  contains: (set: BitsetInterface) => boolean;
  /**
   * Returns true if the bitset contains any value of another bitset
   * @param set
   * @returns
   */
  intersects: (set: BitsetInterface) => boolean;
  /**
   * Clone the bitset.
   * @returns cloned bitset
   */
  clone: () => BitsetInterface;
  /**
   * Returns a string representation of the bitset
   * @returns string representation
   */
  toString: () => string;
}

/**
 * Create a new bitset.
 * It allows to make bitwise operations without the size limitations of a 32 integer.
 */
export class BitSet implements BitsetInterface {
  mask!: Uint32Array;
  size!: number;

  private static GROW_FACTOR = 5;

  constructor(size: number = 10) {
    this.size = size;
    this.mask = new Uint32Array(size);
  }

  has(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.growTo(index + 1);
      return false;
    }

    return Boolean(this.mask[index]! & (1 << (val & 31)));
  }

  or(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.growTo(index + 1);
    }

    this.mask[index] |= 1 << (val & 31);
  }

  xor(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.growTo(index + 1);
    }

    this.mask[index] ^= 1 << (val & 31);
  }

  contains(other: BitsetInterface) {
    const len = Math.min(this.mask.length, other.mask.length);
    for (let i = 0; i < len; i++) {
      const a = this.mask[i]!;
      const b = other.mask[i]!;
      if ((a & b) !== b) {
        return false;
      }
    }
    return true;
  }

  intersects(other: BitsetInterface) {
    const len = Math.min(this.mask.length, other.mask.length);
    for (let i = 0; i < len; i++) {
      const a = this.mask[i]!;
      const b = other.mask[i]!;
      if ((a & b) > 0) {
        return true;
      }
    }
    return false;
  }

  clone() {
    const clone = new BitSet(this.size);
    clone.mask.set(this.mask);
    return clone;
  }

  toString() {
    return this.mask.join("");
  }

  private growTo(to: number) {
    const diff = to - this.size;
    this.size += diff;
    const newMask = new Uint32Array(this.size);
    newMask.set(this.mask);
    this.mask = newMask;
  }
}
