import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { CommonAPIResponse } from "@/types";
import { useAddressStore } from "../store";
import { SaveAddressPayload } from "../types";

export const syncAndClearGuestAddress = async (): Promise<void> => {
  const { getDefaultAddress, hasAddress, clearAll } =
    useAddressStore.getState();

  const guestAddress = hasAddress() ? getDefaultAddress() : null;

  if (!guestAddress) return;

  const payload: SaveAddressPayload = {
    title: guestAddress.label,
    name: guestAddress.address ?? guestAddress.label,
    address_name: guestAddress.address,
    latitude: String(guestAddress.latitude),
    longitude: String(guestAddress.longitude),
    type: guestAddress.label.toLowerCase(),
    other_address_name: guestAddress.address ?? "",
  };

  try {
    await request<CommonAPIResponse>({
      url: `/user/address/save`,
      method: "POST",
      data: payload,
    });

    await queryClient.invalidateQueries({ queryKey: ["CustomerAddress"] });
    clearAll();

    console.log("Guest address synced to backend");
  } catch (error) {
    console.warn("Guest sync failed (non-fatal):", error);
  }
};
