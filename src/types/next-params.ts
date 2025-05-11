/**
 * Utility types for Next.js route parameters
 * 
 * These types make route parameters compatible with Next.js 14+ TypeScript typings
 * which expect params and searchParams objects to be compatible with Promise interfaces
 */

/**
 * Makes a type compatible with Next.js's expected Promise-like interface
 */
export type NextParamsCompatible<T> = T & {
  then: never;
  catch: never;
  finally: never;
  [Symbol.toStringTag]: never;
};

/**
 * Convenience type for route params in API routes
 */
export type RouteParams<T> = {
  params: NextParamsCompatible<T>;
};

/**
 * Convenience type for page props with params
 */
export type PagePropsWithParams<T> = {
  params: NextParamsCompatible<T>;
  searchParams?: NextParamsCompatible<Record<string, string | string[] | undefined>>;
};

/**
 * Convenience type for page props with searchParams
 */
export type PagePropsWithSearchParams<T> = {
  searchParams: NextParamsCompatible<T>;
};
