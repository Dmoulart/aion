/**
 * Create a new bitset.
 * It allows to make bitwise operations without the size limitations of a 32 integer.
 */
export class BitSet {
  bits!: Uint32Array;
  size!: number;

  constructor(size: number = 10) {
    this.size = size;
    this.bits = new Uint32Array(size);
  }

  /**
   * Check if the bitset contains the given value
   * @param val
   * @returns true if the set has the given value
   */
  has(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.growTo(index + 1);
      return false;
    }

    return Boolean(this.bits[index]! & (1 << (val & 31)));
  }

  /**
   * Set the given value.
   * @param val
   * @returns nothing
   */
  or(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.growTo(index + 1);
    }

    this.bits[index] |= 1 << (val & 31);
  }

  /**
   * Unset the given value
   * @param val
   * @returns nothing
   */
  xor(val: number) {
    const index = val >>> 5;

    if (index > this.size) {
      this.growTo(index + 1);
    }

    this.bits[index] ^= 1 << (val & 31);
  }

  /**
   * Returns true if the bitset contains all the values of another bitset
   * @param set
   * @returns
   */
  contains(other: BitSet) {
    const len = Math.min(this.bits.length, other.bits.length);
    for (let i = 0; i < len; i++) {
      const a = this.bits[i]!;
      const b = other.bits[i]!;
      if ((a & b) !== b) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns true if the bitset contains any value of another bitset
   * @param set
   * @returns
   */
  intersects(other: BitSet) {
    const len = Math.min(this.bits.length, other.bits.length);
    for (let i = 0; i < len; i++) {
      const a = this.bits[i]!;
      const b = other.bits[i]!;
      if ((a & b) > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clone the bitset.
   * @returns cloned bitset
   */
  clone() {
    const clone = new BitSet(this.size);
    clone.bits.set(this.bits);
    return clone;
  }

  /**
   * Returns a string representation of the bitset
   * @returns string representation
   */
  toString() {
    return this.bits.join("");
  }

  private growTo(newSize: number) {
    const diff = newSize - this.size;
    this.size += diff;
    const newMask = new Uint32Array(this.size);
    newMask.set(this.bits);
    this.bits = newMask;
  }
}
