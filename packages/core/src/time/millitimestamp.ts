// runtime agnostic millitimestamp
export const millitimestamp = performance.now.bind(performance);
