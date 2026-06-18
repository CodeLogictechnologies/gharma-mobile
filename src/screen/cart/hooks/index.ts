import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { useCallback, useRef } from "react";
import {
  AddToCartBody,
  CartAPIResponse,
  CartItem,
  CouponsResponse,
} from "../types";

export const useCouponCodeList = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["CouponCodeList"],
    enabled: !!token,
    queryFn: () =>
      request<CouponsResponse>({
        url: `/coupon/list`,
        method: "GET",
      }),
  });
};

export const useAddtoCartList = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["AddtoCartList"],
    enabled: !!token,
    queryFn: () =>
      request<CartAPIResponse>({
        url: `/cart/list`,
        method: "GET",
      }),
  });
};

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingVariationMap = new Map<string, string | number>();

export const useAddtoCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pendingDeltaMap = useRef<Map<string, number>>(new Map());

  const mutation = useMutation({
    mutationFn: async (body: AddToCartBody) => {
      return request<CommonAPIResponse>({
        url: `/addtocart`,
        method: "PUT",
        data: body,
      });
    },

    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ["AddtoCartList"] });
      const previousData = queryClient.getQueryData<CartAPIResponse>([
        "AddtoCartList",
      ]);

      queryClient.setQueryData(
        ["AddtoCartList"],
        (old: CartAPIResponse | undefined) => {
          if (!old?.data) return old;

          const existingItem = old.data.find(
            (item: CartItem) =>
              String(item.variation_id) === String(body.variationid),
          );

          if (existingItem) {
            const newQty = Number(body.qty);

            if (newQty <= 0) {
              return {
                ...old,
                data: old.data.filter(
                  (item: CartItem) =>
                    String(item.variation_id) !== String(body.variationid),
                ),
              };
            }

            const unitPrice =
              Number(existingItem.productprice) ||
              Number(existingItem.total_price) /
                Number(existingItem.total_quantity);

            return {
              ...old,
              data: old.data.map((item: CartItem) =>
                String(item.variation_id) === String(body.variationid)
                  ? {
                      ...item,
                      total_quantity: String(newQty),
                      total_price: String(unitPrice * newQty),
                    }
                  : item,
              ),
            };
          } else {
            const productLists = queryClient.getQueriesData<any>({
              queryKey: ["HomePageProductList"],
            });
            const recLists = queryClient.getQueriesData<any>({
              queryKey: ["UserRecommendationList"],
            });

            let unitPrice = 0;
            let productName = "";
            let productImage = "";

            [...productLists, ...recLists].forEach(([_, data]) => {
              if (data?.result?.data) {
                const product = data.result.data.find(
                  (p: any) =>
                    String(p.variation_id ?? p.variationid) ===
                    String(body.variationid),
                );
                if (product) {
                  unitPrice = Number(product.price) || 0;
                  productName = product.title || "";
                  productImage = Array.isArray(product.images)
                    ? product.images[0]
                    : product.images || "";
                }
              }
            });

            return {
              ...old,
              data: [
                ...old.data,
                {
                  variation_id: String(body.variationid),
                  total_quantity: String(body.qty),
                  total_price: String(Number(body.qty) * unitPrice),
                  productprice: String(unitPrice),
                  title: productName,
                  image: productImage,
                } as CartItem,
              ],
            };
          }
        },
      );

      return { previousData };
    },

    onError: (error: any, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["AddtoCartList"], context.previousData);
      }
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["AddtoCartList"] });
    },
  });

  const addToCart = useCallback(
    (variationid: string | number, delta: number = 1) => {
      const key = String(variationid);

      queryClient.setQueryData(
        ["AddtoCartList"],
        (old: CartAPIResponse | undefined) => {
          if (!old?.data) return old;

          const item = old.data.find(
            (i: CartItem) => String(i.variation_id) === key,
          );

          if (item) {
            const currentQty = Number(item.total_quantity);
            const newQty = Math.max(0, currentQty + delta);
            const unitPrice =
              Number(item.productprice) ||
              Number(item.total_price) / Math.max(currentQty, 1);

            if (newQty === 0) {
              return {
                ...old,
                data: old.data.filter(
                  (i: CartItem) => String(i.variation_id) !== key,
                ),
              };
            }

            return {
              ...old,
              data: old.data.map((i: CartItem) =>
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
            const productLists = queryClient.getQueriesData<any>({
              queryKey: ["HomePageProductList"],
            });
            const recLists = queryClient.getQueriesData<any>({
              queryKey: ["UserRecommendationList"],
            });

            let unitPrice = 0;
            let productName = "";
            let productImage = "";

            [...productLists, ...recLists].forEach(([_, data]) => {
              if (data?.result?.data) {
                const product = data.result.data.find(
                  (p: any) => String(p.variation_id ?? p.variationid) === key,
                );
                if (product) {
                  unitPrice = Number(product.price) || 0;
                  productName = product.title || "";
                  productImage = Array.isArray(product.images)
                    ? product.images[0]
                    : product.images || "";
                }
              }
            });

            return {
              ...old,
              data: [
                ...old.data,
                {
                  variation_id: key,
                  total_quantity: String(delta),
                  total_price: String(delta * unitPrice),
                  productprice: String(unitPrice),
                  title: productName,
                  image: productImage,
                } as CartItem,
              ],
            };
          }

          return old;
        },
      );

      const prev = pendingDeltaMap.current.get(key) ?? 0;
      pendingDeltaMap.current.set(key, prev + delta);

      pendingVariationMap.set(key, variationid);

      if (debounceTimers.has(key)) {
        clearTimeout(debounceTimers.get(key));
      }

      const timer = setTimeout(() => {
        debounceTimers.delete(key);
        pendingDeltaMap.current.delete(key);

        const originalVariationid = pendingVariationMap.get(key) ?? variationid;
        pendingVariationMap.delete(key);

        const cartData = queryClient.getQueryData<CartAPIResponse>([
          "AddtoCartList",
        ]);
        const item = cartData?.data?.find(
          (i: CartItem) => String(i.variation_id) === key,
        );

        const finalQty = item ? Number(item.total_quantity) : 0;

        mutation.mutate({
          variationid: originalVariationid,
          qty: String(finalQty),
        });
      }, 800);

      debounceTimers.set(key, timer);
    },
    [mutation, queryClient],
  );

  const flushPendingCart = useCallback(() => {
    debounceTimers.forEach((timer, key) => {
      clearTimeout(timer);
      debounceTimers.delete(key);
      pendingDeltaMap.current.delete(key);

      const originalVariationid = pendingVariationMap.get(key) ?? key;
      pendingVariationMap.delete(key);

      const cartData = queryClient.getQueryData<CartAPIResponse>([
        "AddtoCartList",
      ]);
      const item = cartData?.data?.find(
        (i: CartItem) => String(i.variation_id) === key,
      );

      const finalQty = item ? Number(item.total_quantity) : 0;

      mutation.mutate({
        variationid: originalVariationid,
        qty: String(finalQty),
      });
    });
  }, [mutation, queryClient]);

  return {
    ...mutation,
    mutate: addToCart,
    flushPendingCart,
  };
};

export const useDeleteAddtoCart = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variationid: string | number) => {
      return request<CommonAPIResponse>({
        url: `/cart/delete/${variationid}`,
        method: "DELETE",
      });
    },
    onSuccess: (res) => {
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
      queryClient.invalidateQueries({ queryKey: ["AddtoCartList"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
    },
  });
};
