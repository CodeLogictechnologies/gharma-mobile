import { create } from "zustand";

export interface GuestCartItem {
  variation_id: string | number;
  productid?: string | number;
  title: string;
  image: string;
  price: number | string;
  quantity: number;
}

interface GuestCartState {
  items: GuestCartItem[];

  addItem: (item: Omit<GuestCartItem, "quantity">) => void;
  removeItem: (variation_id: string | number) => void;
  updateQuantity: (variation_id: string | number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (variation_id: string | number) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useGuestCartStore = create<GuestCartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => String(i.variation_id) === String(item.variation_id),
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            String(i.variation_id) === String(item.variation_id)
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }

      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },

  removeItem: (variation_id) => {
    set((state) => {
      const existing = state.items.find(
        (i) => String(i.variation_id) === String(variation_id),
      );

      if (existing && existing.quantity > 1) {
        return {
          items: state.items.map((i) =>
            String(i.variation_id) === String(variation_id)
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          ),
        };
      }

      return {
        items: state.items.filter(
          (i) => String(i.variation_id) !== String(variation_id),
        ),
      };
    });
  },

  updateQuantity: (variation_id, quantity) => {
    if (quantity <= 0) {
      set((state) => ({
        items: state.items.filter(
          (i) => String(i.variation_id) !== String(variation_id),
        ),
      }));
      return;
    }

    set((state) => ({
      items: state.items.map((i) =>
        String(i.variation_id) === String(variation_id)
          ? { ...i, quantity }
          : i,
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getItemQuantity: (variation_id) => {
    const item = get().items.find(
      (i) => String(i.variation_id) === String(variation_id),
    );
    return item?.quantity ?? 0;
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  },
}));
