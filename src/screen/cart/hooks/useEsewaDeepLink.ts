import * as Linking from "expo-linking";
import { useEffect } from "react";

export function useEsewaDeepLink(onReturn?: (url: string) => void) {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes("esewa") || url.includes("payment"))) {
        onReturn?.(url);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("esewa") || url.includes("payment")) {
        onReturn?.(url);
      }
    });

    return () => subscription.remove();
  }, [onReturn]);
}
