export class SparseSet {
  dense: number[] = [];
  sparse: number[] = [];

  /**
   * Insert a new number in the set.
   * @param num
   * @returns nothing
   */
  insert(num: number) {
    this.sparse[num] = this.dense.push(num) - 1;
  }

  /**
   * Check if the given number is already in the set.
   * @param num
   * @returns true if the number is already in the set
   */
  has(num: number) {
    return this.dense[this.sparse[num]!] === num;
  }

  /**
   * Remove a number from the set.
   * @param num
   */
  remove(num: number) {
    if (!this.has(num)) return;

    const last = this.dense.pop()!;

    if (last === num) return;

    const i = this.sparse[num]!;
    this.dense[i] = last;
    this.sparse[last] = i;
  }

  clone() {
    const cloned = new SparseSet();

    cloned.dense = [...this.dense];
    cloned.sparse = [...this.sparse];

    return cloned;
  }

  /**
   * Get the number of elements in the set.
   */
  count() {
    return this.dense.length;
  }

  /**
   * Clear all the set values.
   */
  clear() {
    this.dense = [];
    this.sparse = [];
  }
}
