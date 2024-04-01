export function singleton<T>(init: () => T): () => T {
  let getter = () => {
    const value = init();

    // avoid closure ?
    getter = () => value;

    return value;
  };

  return getter;
}
