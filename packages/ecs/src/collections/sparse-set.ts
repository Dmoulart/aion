export interface SparseSetInterface {
  /**
   * Insert a new number in the set.
   * @param num
   * @returns nothing
   */
  insert(num: number): void;
  /**
   * Check if the given number is already in the set.
   * @param num
   * @returns number is already in the set
   */
  has(num: number): boolean;
  /**
   * Remove a number from the set.
   * @param num
   * @returns nothing
   */
  remove(num: number): void;
  /**
   * Get the number of elements in the set.
   * @returns number of elements in the set
   */
  count(): number;
  /**
   * The elements contained in the set
   */
  dense: number[];
}

export class SparseSet implements SparseSetInterface {
  dense: number[] = [];
  sparse: number[] = [];

  insert(num: number) {
    this.sparse[num] = this.dense.push(num) - 1;
  }

  has(num: number) {
    return this.dense[this.sparse[num]] === num;
  }

  remove(num: number) {
    if (!this.has(num)) return;

    const last = this.dense.pop()!;

    if (last === num) return;

    const i = this.sparse[num];
    this.dense[i] = last;
    this.sparse[last] = i;
  }

  count() {
    return this.dense.length;
  }
}
