import { useAddtoCartList } from "@/features/cart/hooks";
import { useGuestCartStore } from "@/features/cart/store/GuestCartItem";
import { useAuthStore } from "@/store/useAuth";
import { useCallback } from "react";

export const useCartQuantity = () => {
  const token = useAuthStore((s) => s.token);
  const { data: cartList } = useAddtoCartList();
  const guestItems = useGuestCartStore((s) => s.items);

  return useCallback(
    (variationid: string | number): number => {
      if (
        variationid === undefined ||
        variationid === null ||
        variationid === ""
      ) {
        return 0;
      }
      if (token) {
        const item = cartList?.data?.find(
          (c: any) => String(c.variation_id) === String(variationid),
        );
        const qty = item ? Number(item.total_quantity) : 0;
        return isNaN(qty) ? 0 : qty;
      }
      const item = guestItems.find(
        (i) => String(i.variation_id) === String(variationid),
      );
      return item?.quantity ?? 0;
    },
    [token, cartList, guestItems],
  );
};
