import { useAuthStore } from "@/store/useAuth";
import { AddressItem, useAddressStore } from ".";
import { useCustomerAddress } from "../hooks";
import { Address } from "../types";

const mapApiAddress = (raw: Address): AddressItem => ({
  id: String(raw.id),
  label: raw.type ?? "Other",
  address: raw.address_name,
  latitude: Number(raw.latitude),
  longitude: Number(raw.longitude),
  isDefault: raw.status === "Y",
  createdAt: Date.now(),
});

export const useActiveAddress = (): AddressItem | null => {
  const token = useAuthStore((s) => s.token);
  const { data: apiRes } = useCustomerAddress();
  const localAddress = useAddressStore((s) => s.getSelectedAddress());
  const selectedApiAddressId = useAddressStore((s) => s.selectedApiAddressId);

  if (!token) return localAddress;

  const apiAddresses = apiRes?.address ?? [];
  if (apiAddresses.length === 0) return null;

  const raw =
    apiAddresses.find((a) => String(a.id) === selectedApiAddressId) ??
    apiAddresses[0];

  return mapApiAddress(raw);
};
