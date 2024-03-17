export function assert(condition: boolean, msg = "Failed assertion") {
  if (!condition) {
    throw new FailedAssertion(msg);
  }
}

export function <T>(
  value: T,
  msg = `${value} is not defined`,
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new FailedAssertion(msg);
  }
}

export function assertEmpty(
  value: unknown,
  msg = `${value} is defined`,
): asserts value is undefined {
  if (value !== undefined && value !== null) {
    throw new FailedAssertion(msg);
  }
}
export class FailedAssertion extends Error { }
