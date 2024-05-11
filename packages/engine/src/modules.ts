import type { BaseEngine } from "./engine.js";

export type Plugin<
  T = void,
  O extends Record<string, any> | undefined = undefined
> = (engine: BaseEngine, options?: O) => T;

// Extract the return types of each plugin in the array
type PluginReturnTypes<T extends Array<Plugin<any, any>>> = {
  [Index in keyof T]: ReturnType<T[Index]>;
};

// Concatenate the return types into a single object type
export type ConcatenatedReturnType<T extends Array<Plugin<any, any>>> =
  UnionToIntersection<PluginReturnTypes<T>[number]>;

// Extract the parameter types of each plugin in the array
type PluginParameterTypes<T extends Array<Plugin<any, any>>> = {
  [Index in keyof T]: Parameters<T[Index]>[1];
};

// Concatenate the parameter types into a single object type
type ConcatenatedParameterType<T extends Array<Plugin<any, any>>> =
  UnionToIntersection<PluginParameterTypes<T>[number]>;

// Utility to convert union to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// a module is a concatenation of plugins
export type Module<T extends Array<Plugin<any, any>>> = (
  options: ConcatenatedParameterType<T>
) => Plugin<ConcatenatedReturnType<T>>;

export function defineModule<T extends Array<Plugin<any, any>>>(
  plugins: T
): Module<T> {
  return (options: ConcatenatedParameterType<T>) => {
    return (engine: BaseEngine) => {
      const moduleData = {} as ConcatenatedReturnType<T>;

      for (const plugin of plugins) {
        Object.assign(moduleData as any, plugin(engine, options));
      }

      return moduleData;
    };
  };
}

// const preset = defineModule([])
