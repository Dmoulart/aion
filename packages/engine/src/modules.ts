export type Plugin<T = void> = () => T;

export type ModulePlugin<
  T = void,
  O extends Record<string, any> | undefined = undefined
> = (options?: O) => T;

export type ModulePlugins = Record<string, ModulePlugin<any, any>>;

// Extract the return types of each plugin in the array
export type ModuleReturnType<T extends ModulePlugins> = {
  [Key in keyof T]: ReturnType<T[Key]>;
};

// Extract the parameter types of each plugin in the array
export type ModuleParameters<T extends ModulePlugins> = {
  [Index in keyof T]?: Parameters<T[Index]>[0];
};

// a module is a concatenation of plugins
export type Module<T extends ModulePlugins> = (
  options: ModuleParameters<T>
) => ModulePlugin<ModuleReturnType<T>>;

export function defineModule<T extends ModulePlugins>(plugins: T): Module<T> {
  return (options: ModuleParameters<T>) => {
    return () => {
      const moduleData = {} as ModuleReturnType<T>;

      for (const name in plugins) {
        const plugin = plugins[name]!;

        const pluginNamespace = plugin(options);

        if (pluginNamespace) {
          moduleData[name] = pluginNamespace;
        }
      }

      return moduleData;
    };
  };
}

// Extract the return types of each plugin in the array
export type PluginArrayReturnTypes<T extends Array<ModulePlugin>> = {
  [Key in keyof T]: ReturnType<T[Key]>;
};
// Concatenate the return types into a single object type
export type ConcatenatedPluginArrayReturnType<
  T extends Array<ModulePlugin<any, any>>
> = UnionToIntersection<PluginArrayReturnTypes<T>[number]>;

// Utility to convert union to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
