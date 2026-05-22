import { zustandStorage } from "@/libs/mmkvstore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AddressItem = {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  deliveryAvailable?: boolean;
  createdAt: number;
};

type AddressStoreType = {
  addresses: AddressItem[];
  selectedAddressId: string | null;
  selectedApiAddressId: string | null;
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  addAddress: (data: Omit<AddressItem, "id" | "createdAt">) => void;
  updateAddress: (
    id: string,
    data: Partial<Omit<AddressItem, "id" | "createdAt">>,
  ) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  selectApiAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getSelectedAddress: () => AddressItem | null;
  getDefaultAddress: () => AddressItem | null;
  hasAddress: () => boolean;

  skipped: boolean;
  setSkipped: (v: boolean) => void;
  clearAll: () => void;
};

export const useAddressStore = create<AddressStoreType>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,
      selectedApiAddressId: null,
      hydrated: false,

      skipped: false,
      setSkipped: (v) => set({ skipped: v }),
      setHydrated: (v) => set({ hydrated: v }),

      clearAll: () =>
        set({
          addresses: [],
          selectedAddressId: null,
          selectedApiAddressId: null,
        }),

      selectApiAddress: (id) => set({ selectedApiAddressId: id }),

      addAddress: (data) => {
        const newAddress: AddressItem = {
          ...data,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now(),
        };
        set((state) => {
          const isFirst = state.addresses.length === 0;
          return {
            addresses: [
              ...state.addresses.map((a) => ({
                ...a,
                isDefault: newAddress.isDefault ? false : a.isDefault,
              })),
              newAddress,
            ],
            selectedAddressId: isFirst
              ? newAddress.id
              : state.selectedAddressId,
          };
        });
      },

      updateAddress: (id, data) =>
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...data } : addr,
          ),
        })),

      removeAddress: (id) =>
        set((state) => {
          const filtered = state.addresses.filter((addr) => addr.id !== id);
          return {
            addresses: filtered,
            selectedAddressId:
              state.selectedAddressId === id
                ? (filtered[0]?.id ?? null)
                : state.selectedAddressId,
          };
        }),

      selectAddress: (id) => set({ selectedAddressId: id }),

      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          })),
        })),

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        if (!selectedAddressId) return null;
        return addresses.find((a) => a.id === selectedAddressId) ?? null;
      },

      getDefaultAddress: () => {
        const { addresses } = get();
        return addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
      },

      hasAddress: () => get().addresses.length > 0,
    }),
    {
      name: "address-storage-v2",
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const useSelectedAddress = () =>
  useAddressStore((s) => s.getSelectedAddress());
export const useHasAddress = () => useAddressStore((s) => s.hasAddress());
export const useAddressCount = () => useAddressStore((s) => s.addresses.length);
