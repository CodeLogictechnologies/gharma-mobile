// components/common/ProductCard.tsx
import { useGuestCartStore } from "@/screen/cart/store/GuestCartItem";
import { useAuthStore } from "@/store/useAuth";
import { router } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import React, { useRef } from "react";
import { View as RNView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";

interface ProductCardProps {
  variationid: string | number;
  productid?: string | number;
  images: string[] | string;
  title: string;
  price: number | string;
  oldPrice?: number | string;
  discount?: string | number;
  onAddToCart?: () => void;
  onRemoveAddToCart?: () => void;
  isGrid?: boolean;
}

const ProductCard = ({
  variationid,
  productid,
  images,
  title,
  price,
  oldPrice,
  discount,
  onAddToCart,
  onRemoveAddToCart,
  isGrid = false,
}: ProductCardProps) => {
  const imageRef = useRef<RNView>(null);
  const CARD_WIDTH = isGrid ? 100 : 128;
  const IMAGE_HEIGHT = CARD_WIDTH;

  const token = useAuthStore((s) => s.token);
  const { addItem, removeItem, getItemQuantity } = useGuestCartStore();

  // Reactive: subscribes to store changes, re-renders when quantity changes
  // For auth users this will always be 0 — it's ignored in that branch
  const guestQuantity = useGuestCartStore(
    (s) =>
      s.items.find((i) => String(i.variation_id) === String(variationid))
        ?.quantity ?? 0,
  );

  // Auth users: quantity is managed server-side, we don't track it locally
  // Guest users: quantity comes directly from the store (reactive)
  const quantity = token ? 0 : guestQuantity;

  const imageList = Array.isArray(images)
    ? images.filter(Boolean)
    : images
      ? [images]
      : [];

  const firstImage = imageList[0] ?? null;
  const extraImages = imageList.slice(1);

  const handleQuantity = (action: "add" | "remove") => {
    if (token) {
      // Auth user — delegate entirely to server via parent callbacks
      if (action === "add") {
        onAddToCart?.();
      } else {
        onRemoveAddToCart?.();
      }
    } else {
      // Guest user — write to local Zustand store, UI updates reactively
      if (action === "add") {
        addItem({
          variation_id: variationid,
          productid,
          title,
          image: typeof images === "string" ? images : (images?.[0] ?? ""),
          price,
        });
      } else {
        removeItem(variationid);
      }
    }
  };

  const handlePress = () => {
    imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      router.push({
        pathname: "/productdetails",
        params: {
          id: String(variationid),
          imageUri: firstImage,
          sourceX: pageX,
          sourceY: pageY,
          sourceWidth: width,
          sourceHeight: height,
          sourceBorderRadius: 6,
        },
      });
    });
  };

  return (
    <View style={{ width: CARD_WIDTH }} className="bg-white rounded-2xl">
      <View
        style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}
        className="relative bg-slate-50 rounded-md"
      >
        {firstImage ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={handlePress}
            ref={imageRef}
            style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}
          >
            <Animated.Image
              source={{ uri: firstImage }}
              style={{ width: "100%", height: "100%", borderRadius: 6 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={1}
            onPress={handlePress}
            style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}
            className="items-center justify-center"
          >
            <View className="w-12 h-12 rounded-full bg-slate-200" />
          </TouchableOpacity>
        )}

        {extraImages.length > 0 && (
          <View className="absolute bottom-1 left-0 right-0 flex-row justify-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
            {extraImages.map((_, i) => (
              <View
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white opacity-50"
              />
            ))}
          </View>
        )}

        <Animated.View className="absolute -bottom-3 right-1 z-10">
          {quantity === 0 ? (
            <Animated.View entering={ZoomIn} exiting={FadeOut}>
              <TouchableOpacity
                onPress={() => handleQuantity("add")}
                className="bg-white border border-green w-7 h-7 rounded-md items-center justify-center shadow-md"
              >
                <Plus size={14} color="#06812f" strokeWidth={3} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(200)}
              className="flex-row items-center bg-green rounded-md h-7 px-1.5 shadow-md"
            >
              <TouchableOpacity
                onPress={() => handleQuantity("remove")}
                className="p-1"
              >
                <Minus size={14} color="white" strokeWidth={3} />
              </TouchableOpacity>

              <Animated.Text
                key={quantity}
                entering={ZoomIn.duration(200)}
                className="text-white font-bold mx-3 text-sm"
              >
                {quantity}
              </Animated.Text>

              <TouchableOpacity
                onPress={() => handleQuantity("add")}
                className="p-1"
              >
                <Plus size={14} color="white" strokeWidth={3} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <TouchableOpacity onPress={handlePress} className="px-1 mt-4">
        <Text className="text-green text-xs font-bold uppercase">
          {`${discount ?? 20}% OFF`}
        </Text>

        <View className="flex-row items-center">
          <Text className="text-slate-900 font-extrabold text-sm font-inter">
            Rs. {price}
          </Text>
          {oldPrice && (
            <Text className="text-slate-400 line-through text-xxs ml-2 font-inter">
              Rs. {oldPrice}
            </Text>
          )}
        </View>

        <Text className="text-slate-400 text-[10px] font-medium uppercase mt-1">
          KTM CITY
        </Text>
        <Text
          className="text-[13px] font-semibold text-slate-800 leading-4 mt-0.5 font-inter-semibold"
          numberOfLines={2}
          style={{ minHeight: 32 }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;
