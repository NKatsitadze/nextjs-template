type SingletonRegistry = typeof globalThis & { __singletons?: Map<string, unknown> };

/**
 * Returns one instance per process. In development the instance is parked on `globalThis`
 * so hot reloads reuse it instead of opening a new DB/Redis connection on every edit.
 */
export function globalSingleton<T>(key: string, create: () => T): T {
  if (process.env.NODE_ENV === 'production') return create();

  const registry = globalThis as SingletonRegistry;
  registry.__singletons ??= new Map<string, unknown>();
  if (!registry.__singletons.has(key)) registry.__singletons.set(key, create());
  return registry.__singletons.get(key) as T;
}
