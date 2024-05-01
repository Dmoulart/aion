import { expect, it, describe } from "vitest";
import { SparseBitSet2 } from "../src/index.js";

describe("SparseBitSet", () => {
  it("can set value and retrieve it", () => {
    const set = new SparseBitSet2(2);
    set.or(5);
    expect(set.has(5)).toBeTruthy();
    expect(set.has(6)).toBeFalsy();
  });
  it("can flip value", () => {
    const set = new SparseBitSet2(2);
    set.or(5);
    set.xor(5);
    expect(set.has(5)).toBeFalsy();
  });
  it("can test if a set is contained", () => {
    const set = new SparseBitSet2(2);
    set.or(5);
    set.or(6);

    const other = new SparseBitSet2(2);
    other.or(5);

    expect(set.contains(other)).toBeTruthy();
    expect(other.contains(set)).toBeFalsy();
  });
});
