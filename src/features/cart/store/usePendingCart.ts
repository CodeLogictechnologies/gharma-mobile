import { create } from "zustand";

interface CartPendingState {
  pendingIds: Record<string, true>;
  setPending: (variationId: string) => void;
  clearPending: (variationId: string) => void;
}

export const useCartPendingStore = create<CartPendingState>((set) => ({
  pendingIds: {},

  setPending: (variationId) =>
    set((state) =>
      state.pendingIds[variationId]
        ? state
        : { pendingIds: { ...state.pendingIds, [variationId]: true } },
    ),

  clearPending: (variationId) =>
    set((state) => {
      if (!state.pendingIds[variationId]) return state;
      const { [variationId]: _, ...rest } = state.pendingIds;
      return { pendingIds: rest };
    }),
}));

export const useIsCartItemPending = (variationId: string | number): boolean =>
  useCartPendingStore((s) => !!s.pendingIds[String(variationId)]);
