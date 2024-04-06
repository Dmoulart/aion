type AnyFunction = (...args: any[]) => any;
type Cache<T extends AnyFunction> = {
  get: (...args: Parameters<T>) => ReturnType<T>;
  set: (value: ReturnType<T>) => void;
};

export function memo<T extends AnyFunction>(fn: T, cache: Cache<T>): T {
  return ((...args: Parameters<T>) => {
    const result = cache.get(...args);

    if (result !== undefined) {
      return result;
    } else {
      const result = fn(args);
      cache.set(result);
      return result;
    }
  }) as T;
}
