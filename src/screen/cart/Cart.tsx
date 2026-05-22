// screen/cart/Cart.tsx
import { useGuestCartStore } from "@/screen/cart/store/GuestCartItem";
import { useAuthStore } from "@/store/useAuth";
import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  MapPin,
  Minus,
  Plus,
  Search,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector, PanGesture } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BillIcon from "~/assets/images/icon/BillIcon";
import CashIcon from "~/assets/images/icon/CashIcon";
import KhaltiIcon from "~/assets/images/icon/KhaltiIcon";
import { useActiveAddress } from "../address/store/useActiveAddress";
import { useCheckout } from "../home/hooks";
import { OrderRequestBody } from "../home/types";
import Esewa from "./component/Esewa";
import { useAddtoCart, useRemoveAddtoCart } from "./hooks";
import { CartItem } from "./types";

interface CartProps {
  // API cart items — only used when logged in
  data: CartItem[];
  handleGesture?: PanGesture;
  snapToMini?: () => void;
}

const Cart = ({ data, handleGesture, snapToMini }: CartProps) => {
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

  const activeAddress = useActiveAddress();
  const insets = useSafeAreaInsets();

  // Guest cart from local Zustand store
  const guestItems = useGuestCartStore((s) => s.items);
  const { addItem, removeItem } = useGuestCartStore();

  // Auth mutations
  const { mutate: addToCart } = useAddtoCart();
  const { mutate: removeAddToCart } = useRemoveAddtoCart();

  const { mutate: checkoutOrder, isPending: isCheckoutOrderPending } =
    useCheckout();

  // ── Unified display items ─────────────────────────────
  // Auth users  → shape comes from API (CartItem[])
  // Guest users → shape comes from GuestCartStore, mapped to match display needs
  const displayItems = isLoggedIn
    ? data
    : guestItems.map((item) => ({
        variation_id: item.variation_id,
        title: item.title,
        image: item.image,
        total_price: String(Number(item.price) * item.quantity),
        productprice: String(item.price),
        total_quantity: String(item.quantity),
      }));

  const total = displayItems.reduce((s, i) => s + Number(i.total_price), 0);

  // ── Handlers ──────────────────────────────────────────
  const handleAdd = (variationId: string | number) => {
    if (isLoggedIn) {
      addToCart({ variationid: variationId });
    } else {
      // Guest: find existing item to re-add (addItem increments quantity)
      const existing = guestItems.find(
        (i) => String(i.variation_id) === String(variationId),
      );
      if (existing) {
        addItem({
          variation_id: existing.variation_id,
          productid: existing.productid,
          title: existing.title,
          image: existing.image,
          price: existing.price,
        });
      }
    }
  };

  const handleRemove = (variationId: string | number) => {
    if (isLoggedIn) {
      removeAddToCart({ variationid: variationId });
    } else {
      removeItem(variationId);
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!activeAddress) {
      router.push("/myaddress");
      return;
    }
    const payload: OrderRequestBody = {
      total: total - 40 + 50,
      addressid: activeAddress.id,
      items: data.map((item) => ({
        variation_id: item.variation_id,
        quantity: Number(item.total_quantity),
        price: Number(item.productprice),
      })),
    };
    checkoutOrder(payload);
  };

  // ── Empty state ───────────────────────────────────────
  if (displayItems.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-base font-semibold text-gray-700">
            Your basket is empty
          </Text>
          <Text className="text-sm text-gray-400">
            Add items from the home screen
          </Text>
        </View>
      </View>
    );
  }

  // ── Header ────────────────────────────────────────────
  const headerInner = (
    <View
      className="bg-white"
      style={{ paddingTop: 4, paddingBottom: 14, paddingHorizontal: 20 }}
    >
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (handleGesture) {
              snapToMini?.();
              return;
            }
            try {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(app)/(tabs)/(home)");
              }
            } catch {
              router.replace("/(app)/(tabs)/(home)");
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-8 h-8 items-center justify-center"
        >
          <ChevronLeft size={22} color="black" strokeWidth={2.5} />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-base font-bold text-gray-900">Basket</Text>
          <TouchableOpacity
            onPress={() => router.push("/myaddress")}
            className="flex-row items-center gap-1 mt-0.5"
          >
            <MapPin size={11} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {activeAddress?.address
                ? activeAddress.address.length > 25
                  ? `${activeAddress.address.substring(0, 25)}...`
                  : activeAddress.address
                : "Select delivery address"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-8 h-8 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Search size={20} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Header = handleGesture ? (
    <GestureDetector gesture={handleGesture}>
      <View>{headerInner}</View>
    </GestureDetector>
  ) : (
    headerInner
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
      {Header}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 12, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-lg p-4">
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity
              onPress={() => router.push("/myaddress")}
              hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }}
            >
              <Text className="text-sm font-bold text-gray-900">Delivery</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <MapPin size={11} color="#D7A11B" />
                <Text className="text-xs text-gray-600" numberOfLines={1}>
                  {activeAddress?.address
                    ? activeAddress.address.length > 25
                      ? `${activeAddress.address.substring(0, 25)}...`
                      : activeAddress.address
                    : "Select delivery address"}
                </Text>
                <ChevronRight size={10} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            <Text className="text-xs text-gray-400">
              {displayItems.length} Products
            </Text>
          </View>

          <TouchableOpacity className="border border-gray-300 rounded-md px-4 py-2 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-green">
              Today, 4:00 PM – 5:00 PM
            </Text>
            <ChevronRight
              size={16}
              color="#16A34A"
              strokeWidth={2.5}
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </TouchableOpacity>

          {/* Items */}
          <View className="mt-3 gap-3">
            {displayItems.map((item, idx) => (
              <View key={String(item.variation_id)}>
                {idx > 0 && <View className="h-px bg-gray-100 mb-3" />}
                <View className="flex-row items-center gap-3">
                  <View className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden items-center justify-center">
                    <Image
                      source={{ uri: item.image }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-gray-900"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">Kg</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-sm font-bold text-gray-900">
                        Rs. {item.total_price}
                      </Text>
                      <Text className="text-xs text-gray-400 line-through">
                        Rs. 2000
                      </Text>
                    </View>
                  </View>

                  <View
                    className="flex-row items-center rounded-md overflow-hidden"
                    style={{ backgroundColor: "#1B6B3A" }}
                  >
                    <TouchableOpacity
                      onPress={() => handleRemove(item.variation_id)}
                      className="w-7 h-7 items-center justify-center"
                    >
                      <Minus size={14} color="white" strokeWidth={3} />
                    </TouchableOpacity>
                    <Text className="max-w-10 text-center font-medium text-xs text-white">
                      {item.total_quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleAdd(item.variation_id)}
                      className="w-7 h-7 items-center justify-center"
                    >
                      <Plus size={14} color="white" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment method */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-semibold text-gray-900 mb-3">
            Payment Through
          </Text>
          <View className="flex-row gap-2">
            <Esewa />
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-3">
              <KhaltiIcon />
              <Text className="text-x font-semibold text-gray-700">KHALTI</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-3">
              <CashIcon />
              <Text className="text-x font-semibold text-gray-700">CASH</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promo */}
        <View className="bg-white rounded-lg px-4 py-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-gray-800">SALE2026</Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm font-semibold text-primary">
              Promo Code Applied
            </Text>
            <CircleCheck size={15} />
          </View>
        </View>

        {/* Summary */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-semibold text-gray-900 mb-4">
            Payment Summary
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-600">Basket Value</Text>
                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                  <Text className="text-xxs font-bold text-green-700">
                    SAVED Rs. 50
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs text-gray-400 line-through">
                  Rs. {total}
                </Text>
                <Text className="text-sm font-semibold text-gray-900">
                  Rs. {total}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-600">Voucher/Code</Text>
              <Text className="text-sm font-semibold text-gray-900">
                − Rs. 40
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-600">Delivery Charge</Text>
              <Text className="text-sm font-semibold text-gray-900">
                Rs. 50
              </Text>
            </View>

            <View className="h-px bg-gray-100" />

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <BillIcon />
                <View>
                  <Text className="text-xs font-bold text-gray-900">
                    TO PAY
                  </Text>
                  <Text className="text-xxs text-gray-400 uppercase tracking-wide">
                    Inclusive of all taxes and charges
                  </Text>
                </View>
              </View>
              <Text className="text-sm font-bold text-gray-900">
                Rs. {total - 40 + 50}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-2" />
      </ScrollView>

      {/* Checkout */}
      <View
        className="bg-white px-4 pt-3"
        style={{ paddingBottom: insets.bottom }}
      >
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={isCheckoutOrderPending}
          className={`bg-primary py-2.5 rounded-md ${
            isCheckoutOrderPending ? "opacity-70" : ""
          }`}
        >
          {isCheckoutOrderPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              {isLoggedIn ? "Checkout" : "Login to Checkout"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Cart;
