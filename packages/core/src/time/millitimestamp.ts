// @todo: runtime agnostic millitimestamp
export const millitimestamp = window.performance.now.bind(window.performance);
