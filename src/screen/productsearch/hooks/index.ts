import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { ProductSearchWordsResponse, SaveSearchWordsBody } from "../types";

export const useProductSearchWords = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["ProductSearchWords"],
    enabled: !!token,
    queryFn: () =>
      request<ProductSearchWordsResponse>({
        url: `/items/search/history`,
        method: "GET",
      }),
  });
};

export const useSaveSearchWords = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: SaveSearchWordsBody) => {
      const res = await request<CommonAPIResponse>({
        url: `/items/search/save`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      // toast.show({
      //   variant: "success",
      //   label: "Success",
      //   description: res?.message,
      // });

      queryClient.invalidateQueries({ queryKey: ["ProductSearchWords"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Error:", error.message);
    },
  });
};

export const useRemoveSearchWords = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await request<CommonAPIResponse>({
        url: `/items/search/delete/${id}`,
        method: "DELETE",
      });
      return res;
    },
    onSuccess: (res) => {
      // toast.show({
      //   variant: "success",
      //   label: "Success",
      //   description: res?.message,
      // });

      queryClient.invalidateQueries({ queryKey: ["ProductSearchWords"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Error:", error.message);
    },
  });
};
