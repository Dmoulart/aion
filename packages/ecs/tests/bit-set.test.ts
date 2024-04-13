import { expect, it, describe } from "vitest";
import { BitSet } from "../src/index.js";

describe("BitSet", () => {
  it("can set value and retrieve it", () => {
    const set = new BitSet(10);
    set.or(5);
    expect(set.has(5)).toBeTruthy();
    expect(set.has(6)).toBeFalsy();
  });
  it("can flip value", () => {
    const set = new BitSet(10);
    set.or(5);
    set.xor(5);
    expect(set.has(5)).toBeFalsy();
  });
  it("can test if a set is contained", () => {
    const set = new BitSet(10);
    set.or(5);
    set.or(6);

    const other = new BitSet(10);
    other.or(5);

    expect(set.contains(other)).toBeTruthy();
    expect(other.contains(set)).toBeFalsy();
  });
});
