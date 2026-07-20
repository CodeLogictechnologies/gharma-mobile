import { request } from "@/services/api/client";
import { useQuery } from "@tanstack/react-query";
import { ReturnRefundPolicyResponse } from "../types";

export const useRefundPolicy = () => {
  return useQuery({
    queryKey: ["RefundPolicy"],
    queryFn: () =>
      request<ReturnRefundPolicyResponse>({
        url: `/refund-return/policy`,
        method: "GET",
      }),
  });
};
