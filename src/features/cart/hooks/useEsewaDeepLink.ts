import * as Linking from "expo-linking";
import { useCallback, useEffect } from "react";

export function useEsewaDeepLink(onReturn?: (url: string) => void) {
  const handleURL = useCallback(
    (url: string) => {
      if (url && (url.includes("esewa") || url.includes("payment"))) {
        onReturn?.(url);
      }
    },
    [onReturn],
  );

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleURL(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleURL(url);
    });

    return () => subscription.remove();
  }, [handleURL]);
}
