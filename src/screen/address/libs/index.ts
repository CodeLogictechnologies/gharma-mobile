// screen/address/syncAddress.ts
import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { CommonAPIResponse } from "@/types";
import { useAddressStore } from "../store";
import { SaveAddressPayload } from "../types";



export const syncAndClearGuestAddress = async (): Promise<void> => {
  const { getDefaultAddress, hasAddress, clearAll } =
    useAddressStore.getState();

  const guestAddress = hasAddress() ? getDefaultAddress() : null;

  clearAll();

  if (!guestAddress) return;

  const payload: SaveAddressPayload = {
    title: guestAddress.label,
    name: guestAddress.receiverName ?? guestAddress.label,
    address_name: guestAddress.address,
    latitude: String(guestAddress.latitude),
    longitude: String(guestAddress.longitude),
    type: guestAddress.label.toLowerCase(),
    other_address_name: guestAddress.landmark ?? "",
  };

  try {
    await request<CommonAPIResponse>({
      url: `/user/address/save`,
      method: "POST",
      data: payload,
    });

    await queryClient.invalidateQueries({ queryKey: ["CustomerAddress"] });

    console.log("[address] Guest address synced to backend");
  } catch (error) {
    console.warn("[address] Guest sync failed (non-fatal):", error);
  }
};
