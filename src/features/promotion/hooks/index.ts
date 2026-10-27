import { request } from "@/services/api/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PromotionAppliesTo, PromotionItemsResponse } from "../types";

const PER_PAGE = 10;

interface UsePromotionItemsParams {
  promotionId: string;
  appliesTo: PromotionAppliesTo;
}

export const usePromotionItems = ({
  promotionId,
  appliesTo,
}: UsePromotionItemsParams) => {
  return useInfiniteQuery({
    queryKey: ["PromotionItems", promotionId, appliesTo],
    enabled: !!promotionId,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      request<PromotionItemsResponse>({
        url: `/promotions/${promotionId}/${appliesTo}`,
        method: "GET",
        params: { page: pageParam, per_page: PER_PAGE },
      }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.result;
      return pagination.has_more ? pagination.current_page + 1 : undefined;
    },
  });
};
