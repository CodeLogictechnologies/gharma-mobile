import { useCallback, useRef } from "react";

export const useStableCallback = <Args extends unknown[], R>(
  fn: ((...args: Args) => R) | undefined,
): ((...args: Args) => R | undefined) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback((...args: Args) => fnRef.current?.(...args), []);
};
