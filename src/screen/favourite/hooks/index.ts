import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { FavouriteAPIResponse, FavouriteItemBody } from "../types";

export const useGetFavouriteList = () => {
  const token = useAuthStore((s) => s.token);

  return useInfiniteQuery({
    queryKey: ["GetFavouriteList"],
    enabled: !!token,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      request<FavouriteAPIResponse>({
        url: `/user/favourite/list`,
        method: "GET",
        params: { page: pageParam, per_page: 20 },
      }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (pagination?.has_more && pagination?.next_page) {
        return pagination.next_page;
      }
      return undefined;
    },
  });
};
export const useSaveToFavourite = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: FavouriteItemBody) => {
      const res = await request<CommonAPIResponse>({
        url: `/save/favourite`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onMutate: async (body) => {
      const queryKey = ["ProductDetails", body.variationid];
      await queryClient.cancelQueries({ queryKey });

      const previousProduct = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          details: {
            ...old.details,
            is_favourite: true,
          },
        };
      });

      return { previousProduct, queryKey };
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Error:", error.message);
    },
    onSettled: (_, __, body) => {
      queryClient.invalidateQueries({
        queryKey: ["ProductDetails", body.variationid],
      });
      queryClient.invalidateQueries({
        queryKey: ["GetFavouriteList"],
      });
    },
  });
};

export const useRemoveToFavourite = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variationid: string) => {
      const res = await request<CommonAPIResponse>({
        url: `/user/favourite/delete/${variationid}`,
        method: "DELETE",
      });
      return res;
    },

    onMutate: async (variationId) => {
      const queryKey = ["ProductDetails", variationId];
      await queryClient.cancelQueries({ queryKey });

      const previousProduct = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          details: {
            ...old.details,
            is_favourite: false,
          },
        };
      });

      return { previousProduct, queryKey };
    },
    onError: (error: any, _, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(context.queryKey, context.previousProduct);
      }
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Error:", error.message);
    },
    onSettled: (_, __, variationId) => {
      queryClient.invalidateQueries({
        queryKey: ["GetFavouriteList"],
      });
      queryClient.invalidateQueries({
        queryKey: ["ProductDetails", variationId],
      });
    },
  });
};
