import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { CommonAPIResponse } from "@/types";
import { useGuestCartStore } from "../store/GuestCartItem";

export const syncAndClearGuestCart = async (): Promise<void> => {
  const { items, clearCart } = useGuestCartStore.getState();

  const guestItems = [...items];

  if (guestItems.length === 0) return;

  const requests = guestItems.flatMap((item) =>
    Array.from({ length: item.quantity }, () =>
      request<CommonAPIResponse>({
        url: `/addtocart`,
        method: "POST",
        data: { variationid: item.variation_id },
      }).catch((err) => {
        console.warn(
          `[cart] Failed to sync item ${item.variation_id}:`,
          err?.message,
        );
      }),
    ),
  );

  try {
    await Promise.all(requests);

    clearCart();

    await queryClient.invalidateQueries({ queryKey: ["AddtoCartList"] });
    console.log(`${guestItems.length} guest item(s) synced to backend`);
  } catch (err) {
    console.warn("Guest cart sync failed (non-fatal):", err);
  }
};
