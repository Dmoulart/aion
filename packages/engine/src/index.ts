import { startRenderLoop } from "aion-render";

export function defineEngine<T>(setup: () => T) {
  setup();
  return () => {
    startRenderLoop(() => {});
  };
}
