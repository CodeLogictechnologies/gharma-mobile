import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { AddToCartBody, CartAPIResponse, CartItem } from "../types";

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

export const useAddtoCart = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: AddToCartBody) => {
      const res = await request<CommonAPIResponse>({
        url: `/addtocart`,
        method: "POST",
        data: body,
      });
      return res;
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
            const newQty = Number(existingItem.total_quantity) + 1;
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
                  total_quantity: "1",
                  total_price: String(unitPrice),
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
};

export const useDeleteAddtoCart = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variationid: string | number) => {
      const res = await request<CommonAPIResponse>({
        url: `/cart/delete/${variationid}`,
        method: "DELETE",
      });
      return res;
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

export const useRemoveAddtoCart = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: AddToCartBody) => {
      if (!body.variationid || body.variationid === "undefined") {
        throw new Error(`Invalid variationid: ${body.variationid}`);
      }
      const res = await request<CommonAPIResponse>({
        url: `/cart/remove/${body.variationid}`,
        method: "DELETE",
      });
      return res;
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

          return {
            ...old,
            data: old.data
              .map((item: CartItem) => {
                if (String(item.variation_id) === String(body.variationid)) {
                  const newQty = Number(item.total_quantity) - 1;
                  const unitPrice =
                    Number(item.productprice) ||
                    Number(item.total_price) / Number(item.total_quantity);

                  if (newQty <= 0) return null;

                  return {
                    ...item,
                    total_quantity: String(newQty),
                    total_price: String(unitPrice * newQty),
                  };
                }
                return item;
              })
              .filter(Boolean) as CartItem[],
          };
        },
      );

      return { previousData };
    },
    onSuccess: (res) => {
      //toast.show({ variant: "success", label: "Removed", description: res?.message });
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
};
