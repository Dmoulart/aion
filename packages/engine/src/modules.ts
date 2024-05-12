export type Plugin<
  T = void,
  O extends Record<string, any> | undefined = undefined
> = (options?: O) => T;

export type PluginMap = Record<string, Plugin<any, any>>;

// Extract the return types of each plugin in the array
export type PluginMapReturnTypes<T extends PluginMap> = {
  [Key in keyof T]: ReturnType<T[Key]>;
};

// Extract the parameter types of each plugin in the array
export type PluginMapParameterTypes<T extends PluginMap> =
  OptionalPluginMapParameterTypes<T>;

export type RequiredPluginMapParameterTypes<T extends PluginMap> = {
  [Index in keyof T]: Parameters<T[Index]>[0] extends undefined
    ? never
    : Parameters<T[Index]>[0];
};

export type OptionalPluginMapParameterTypes<T extends PluginMap> = {
  [Index in keyof T]?: Parameters<T[Index]>[0] extends infer U | undefined
    ? undefined extends U
      ? Parameters<T[Index]>[0]
      : never
    : never;
};

// Extract the return types of each plugin in the array
export type PluginArrayReturnTypes<T extends Array<Plugin>> = {
  [Key in keyof T]: ReturnType<T[Key]>;
};
// Concatenate the return types into a single object type
export type ConcatenatedPluginArrayReturnType<
  T extends Array<Plugin<any, any>>
> = UnionToIntersection<PluginArrayReturnTypes<T>[number]>;

// Utility to convert union to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// a module is a concatenation of plugins
export type Module<T extends PluginMap> = (
  options: PluginMapParameterTypes<T>
) => Plugin<PluginMapReturnTypes<T>>;

export function defineModule<T extends PluginMap>(plugins: T): Module<T> {
  return (options: PluginMapParameterTypes<T>) => {
    return () => {
      const moduleData = {} as PluginMapReturnTypes<T>;

      for (const name in plugins) {
        const plugin = plugins[name]!;

        Object.assign(moduleData, plugin(options));
      }

      return moduleData;
    };
  };
}

const preset = defineModule({
  ecs(opts?: { record?: string }) {
    return {
      test: "ok",
    };
  },
});

preset({
  ecs: {},
});
