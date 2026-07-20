import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { useCallback } from "react";
import { cartService } from "../services";
import { useCartPendingStore } from "../store/usePendingCart";
import {
  CartAPIResponse,
  CartItem,
  CartRequestError,
  UpdateCartPayload,
} from "../types";

const CART_LIST_KEY = ["AddtoCartList"] as const;
const CART_SYNC_DEBOUNCE_MS = 800;

export const useCouponCodeList = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["CouponCodeList"],
    enabled: !!token,
    queryFn: cartService.fetchCoupons,
  });
};

export const useAddtoCartList = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: [...CART_LIST_KEY],
    enabled: !!token,
    queryFn: cartService.fetchCartList,
  });
};

interface CartSyncEntry {
  variationid: string | number;
  baseline: CartItem | null;
  /** Net delta of the cycle; quantity fallback if the list was never cached. */
  pendingDelta: number;
  timer?: ReturnType<typeof setTimeout>;
  controller?: AbortController;
}

// Module-level: taps for the same item from different screens (Home,
// SubCategories, ProductDetails, Cart) must share a single cycle.
const cartSync = new Map<string, CartSyncEntry>();

interface CartMutationVariables extends UpdateCartPayload {
  key: string;
  signal: AbortSignal;
}

interface CartMutationContext {
  baseline: CartItem | null;
}

const findCartItem = (items: CartItem[], key: string): CartItem | undefined =>
  items.find((item) => String(item.variation_id) === key);

interface CachedProductLike {
  variation_id?: string | number;
  variationid?: string | number;
  price?: string | number;
  title?: string;
  images?: string[] | string | null;
}

interface CachedProductList {
  result?: { data?: CachedProductLike[] };
}

/** Best-effort product info from already-cached product lists, used to
 *  render a cart entry optimistically before the server echoes it back. */
const lookupProductInfo = (queryClient: QueryClient, key: string) => {
  const sources = [
    ...queryClient.getQueriesData<CachedProductList>({
      queryKey: ["HomePageProductList"],
    }),
    ...queryClient.getQueriesData<CachedProductList>({
      queryKey: ["UserRecommendationList"],
    }),
  ];

  let unitPrice = 0;
  let title = "";
  let image = "";

  sources.forEach(([, data]) => {
    const products = data?.result?.data;
    if (!products) return;
    const product = products.find(
      (p) => String(p.variation_id ?? p.variationid) === key,
    );
    if (product) {
      unitPrice = Number(product.price) || 0;
      title = product.title ?? "";
      image = Array.isArray(product.images)
        ? (product.images[0] ?? "")
        : (product.images ?? "");
    }
  });

  return { unitPrice, title, image };
};

/** Applies a quantity delta to the cached cart list (the optimistic write). */
const applyDeltaToCache = (
  queryClient: QueryClient,
  key: string,
  delta: number,
) => {
  queryClient.setQueryData<CartAPIResponse>(CART_LIST_KEY, (old) => {
    if (!old?.data) return old;

    const item = findCartItem(old.data, key);

    if (item) {
      const currentQty = Number(item.total_quantity);
      const newQty = Math.max(0, currentQty + delta);
      const unitPrice =
        Number(item.productprice) ||
        Number(item.total_price) / Math.max(currentQty, 1);

      if (newQty === 0) {
        return {
          ...old,
          data: old.data.filter((i) => String(i.variation_id) !== key),
        };
      }

      return {
        ...old,
        data: old.data.map((i) =>
          String(i.variation_id) === key
            ? {
                ...i,
                total_quantity: String(newQty),
                total_price: String(newQty * unitPrice),
              }
            : i,
        ),
      };
    }

    if (delta > 0) {
      const { unitPrice, title, image } = lookupProductInfo(queryClient, key);
      const newItem = {
        variation_id: key,
        total_quantity: String(delta),
        total_price: String(delta * unitPrice),
        productprice: String(unitPrice),
        title,
        image,
      } as CartItem;

      return { ...old, data: [...old.data, newItem] };
    }

    return old;
  });
};

/** Atomically restores a single item to its server-confirmed state,
 *  leaving every other (possibly still optimistic) item untouched. */
const restoreCartItem = (
  queryClient: QueryClient,
  key: string,
  baseline: CartItem | null,
) => {
  queryClient.setQueryData<CartAPIResponse>(CART_LIST_KEY, (old) => {
    if (!old?.data) return old;

    const exists = !!findCartItem(old.data, key);

    if (!baseline) {
      // Item did not exist on the server before this cycle: drop the ghost.
      return exists
        ? {
            ...old,
            data: old.data.filter((i) => String(i.variation_id) !== key),
          }
        : old;
    }

    return exists
      ? {
          ...old,
          data: old.data.map((i) =>
            String(i.variation_id) === key ? baseline : i,
          ),
        }
      : { ...old, data: [...old.data, baseline] };
  });
};

/** After a confirmed request, the confirmed quantity becomes the new
 *  rollback point for any taps that were queued while it was in flight. */
const confirmBaseline = (entry: CartSyncEntry, key: string, qty: string) => {
  const confirmedQty = Number(qty);
  if (confirmedQty <= 0) {
    entry.baseline = null;
    return;
  }

  const source = entry.baseline;
  if (!source) return; // new item; server list will provide it on next refetch

  const unitPrice =
    Number(source.productprice) ||
    Number(source.total_price) / Math.max(Number(source.total_quantity), 1);

  entry.baseline = {
    ...source,
    total_quantity: String(confirmedQty),
    total_price: String(confirmedQty * unitPrice),
  };
};

export const useAddtoCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setPending = useCartPendingStore((s) => s.setPending);
  const clearPending = useCartPendingStore((s) => s.clearPending);

  const mutation = useMutation<
    CommonAPIResponse,
    CartRequestError,
    CartMutationVariables,
    CartMutationContext
  >({
    mutationFn: ({ variationid, qty, signal }) =>
      cartService.updateCartItem({ variationid, qty }, signal),

    onMutate: async ({ key }) => {
      // The optimistic write already happened on tap (instant UI). Here we
      // only stop refetches from clobbering it and capture the rollback point.
      await queryClient.cancelQueries({ queryKey: CART_LIST_KEY });
      return { baseline: cartSync.get(key)?.baseline ?? null };
    },

    onSuccess: (_data, { key, qty, signal }) => {
      const entry = cartSync.get(key);
      // A newer request for this item owns the outcome.
      if (!entry || entry.controller?.signal !== signal) return;

      if (entry.timer) {
        // User kept tapping while this request was in flight; the cycle
        // stays open but rolls forward from the just-confirmed quantity.
        entry.controller = undefined;
        confirmBaseline(entry, key, qty);
      } else {
        cartSync.delete(key);
        clearPending(key);
      }
    },

    onError: (error, { key, signal }, context) => {
      // Cancelled because a newer request superseded it — not a failure.
      if (signal.aborted) return;

      const entry = cartSync.get(key);
      if (entry?.timer) clearTimeout(entry.timer);
      cartSync.delete(key);
      clearPending(key);

      restoreCartItem(queryClient, key, context?.baseline ?? null);

      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
    },

    onSettled: (_data, error, { signal }) => {
      if (error && signal.aborted) return;
      // Refetch only when no item has a pending or in-flight cycle,
      // otherwise the server snapshot would erase optimistic quantities.
      if (cartSync.size === 0) {
        queryClient.invalidateQueries({ queryKey: CART_LIST_KEY });
      }
    },
  });

  const send = useCallback(
    (key: string) => {
      const entry = cartSync.get(key);
      if (!entry) return;
      entry.timer = undefined;

      // Last write wins per item: cancel a superseded in-flight request.
      entry.controller?.abort();
      const controller = new AbortController();
      entry.controller = controller;

      const cache = queryClient.getQueryData<CartAPIResponse>(CART_LIST_KEY);
      const cachedItem = cache?.data
        ? findCartItem(cache.data, key)
        : undefined;
      const qty = cache?.data
        ? cachedItem
          ? Number(cachedItem.total_quantity)
          : 0
        : Math.max(0, entry.pendingDelta);

      mutation.mutate({
        key,
        variationid: entry.variationid,
        qty: String(qty),
        signal: controller.signal,
      });
    },
    [mutation, queryClient],
  );

  /**
   * Optimistically applies `delta` to the cached cart (instant UI feedback)
   * and schedules a debounced, per-item server sync of the resulting
   * absolute quantity.
   */
  const addToCart = useCallback(
    (variationid: string | number, delta: number = 1) => {
      const key = String(variationid);

      let entry = cartSync.get(key);
      if (!entry) {
        // First tap of a cycle: snapshot the server-confirmed state BEFORE
        // any optimistic write so a failure can roll back cleanly.
        const cache = queryClient.getQueryData<CartAPIResponse>(CART_LIST_KEY);
        entry = {
          variationid,
          baseline: (cache?.data && findCartItem(cache.data, key)) ?? null,
          pendingDelta: 0,
        };
        cartSync.set(key, entry);
        setPending(key);
      }

      entry.pendingDelta += delta;
      applyDeltaToCache(queryClient, key, delta);

      if (entry.timer) clearTimeout(entry.timer);
      entry.timer = setTimeout(() => send(key), CART_SYNC_DEBOUNCE_MS);
    },
    [queryClient, send, setPending],
  );

  /** Immediately syncs every debounced item (e.g. before checkout). */
  const flushPendingCart = useCallback(() => {
    cartSync.forEach((entry, key) => {
      if (!entry.timer) return;
      clearTimeout(entry.timer);
      entry.timer = undefined;
      send(key);
    });
  }, [send]);

  return {
    ...mutation,
    mutate: addToCart,
    flushPendingCart,
  };
};

export const useDeleteAddtoCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<CommonAPIResponse, CartRequestError, string | number>({
    mutationFn: cartService.deleteCartItem,
    onSuccess: (res) => {
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
      queryClient.invalidateQueries({ queryKey: CART_LIST_KEY });
    },
    onError: (error) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
    },
  });
};
