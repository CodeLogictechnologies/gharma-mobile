import { request } from "@/api/axios";
import { ProfileUpdateFormData } from "@/app/(app)/profileupdate";
import { queryClient } from "@/libs/query";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { LoyaltyPointResponse, UserProfileResponse } from "../types";

export const useGetUserDetails = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["GetUserDetails"],
    enabled: !!token,
    queryFn: () =>
      request<UserProfileResponse>({
        url: `/user/detail`,
        method: "GET",
      }),
  });
};

export const useUserLoyalty = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["UserLoyalty"],
    enabled: !!token,
    queryFn: () =>
      request<LoyaltyPointResponse>({
        url: `/loyalty/list`,
        method: "GET",
      }),
  });
};

export const useProfileUupdate = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: ProfileUpdateFormData) => {
      const res = await request<CommonAPIResponse>({
        url: `/user/update`,
        method: "PUT",
        data: body,
      });
      console.log("res", res);
      return res;
    },
    onSuccess: (res) => {
      console.log("login res", res);

      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
      // router.navigate("/(app)/(tabs)/profile");

      queryClient.invalidateQueries({ queryKey: ["GetUserDetails"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Profile Update Error:", error);
    },
  });
};
