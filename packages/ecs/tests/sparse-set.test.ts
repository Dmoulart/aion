import { expect, it, describe } from "vitest";
import { SparseSet } from "../src/index.js";

describe("SparseSet", () => {
  it("can be created", () => {
    expect(() => new SparseSet()).not.toThrowError();
  });

  it("can insert a number", () => {
    const sset = new SparseSet();
    expect(() => sset.insert(1)).not.toThrowError();
  });

  it("can insert two times the same number", () => {
    const sset = new SparseSet();
    sset.insert(1);
    expect(() => sset.insert(1)).not.toThrowError();
  });

  it("it can verify that it has a given value", () => {
    const sset = new SparseSet();
    sset.insert(1);
    expect(sset.has(1)).toStrictEqual(true);
  });

  it("it can verify that it has not a given value", () => {
    const sset = new SparseSet();
    sset.insert(2);
    expect(sset.has(1)).toStrictEqual(false);
  });

  it("it can safely remove an existing value", () => {
    const sset = new SparseSet();
    sset.insert(1);
    sset.insert(2);
    expect(() => sset.remove(1)).not.toThrowError();
  });

  it("it can safely try to remove a non existing value", () => {
    const sset = new SparseSet();
    sset.insert(1);
    expect(() => sset.remove(2)).not.toThrowError();
  });

  it("it can remove an existing value", () => {
    const sset = new SparseSet();
    sset.insert(2);
    sset.remove(2);
    expect(sset.has(2)).toStrictEqual(false);
  });

  it("it can give the exact dense array lenght", () => {
    const sset = new SparseSet();
    sset.insert(1);
    sset.insert(2);
    sset.insert(3);
    expect(sset.count()).toEqual(3);
  });
});
