export function assertDefined<T>(
  value: T,
  msg = `${value} is not defined`
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(msg);
  }
}

export function assertEmpty(
  value: unknown,
  msg = `${value} is defined`
): asserts value is undefined {
  if (value !== undefined && value !== null) {
    throw new Error(msg);
  }
}
