import {
  getPriceRange,
  isWholesalerItem,
  resolvePrice,
} from "@/libs/pricehelper";
import { useGuestCartStore } from "@/screen/cart/store/GuestCartItem";
import { useAuthStore } from "@/store/useAuth";
import { router } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  View as RNView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { type ProductItem } from "../../screen/home/types";

interface ProductCardProps {
  item: ProductItem;
  onAddToCart?: () => void;
  onRemoveAddToCart?: () => void;
  isGrid?: boolean;
  cardWidth?: number;
  quantity?: number;
}

const ProductCard = ({
  item,
  onAddToCart,
  onRemoveAddToCart,
  isGrid = false,
  cardWidth,
  quantity: propQuantity,
}: ProductCardProps) => {
  const { variationid, productid, images, title } = item;

  const imageRef = useRef<RNView>(null);
  const inputRef = useRef<TextInput>(null);
  const CARD_WIDTH = cardWidth ?? (isGrid ? 100 : 128);
  const IMAGE_HEIGHT = CARD_WIDTH;

  const token = useAuthStore((s) => s.token);
  const { addItem, removeItem, updateQuantity } = useGuestCartStore();

  const guestQuantity = useGuestCartStore(
    (s) =>
      s.items.find((i) => String(i.variation_id) === String(variationid))
        ?.quantity ?? 0,
  );

  const quantity = Number(propQuantity ?? guestQuantity);
  const [inputValue, setInputValue] = useState(String(quantity));

  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const wholesaler = isWholesalerItem(item);
  const { low, high, minQty } = getPriceRange(item);
  const effectivePrice = resolvePrice(item, Math.max(quantity, 1));

  const imageList = Array.isArray(images)
    ? images.filter(Boolean)
    : images
      ? [images]
      : [];
  const firstImage = imageList[0] ?? null;
  const extraImages = imageList.slice(1);

  const handleQuantity = (action: "add" | "remove") => {
    if (token) {
      action === "add" ? onAddToCart?.() : onRemoveAddToCart?.();
    } else {
      if (action === "add") {
        addItem({
          variation_id: variationid,
          productid,
          title,
          image: typeof images === "string" ? images : (images?.[0] ?? ""),
          price: resolvePrice(item, quantity + 1),
        });
      } else {
        removeItem(variationid);
      }
    }
  };

  const handleInputChange = (text: string) => {
    // Allow empty string while typing so user can clear and retype
    setInputValue(text.replace(/[^0-9]/g, ""));
  };

  const handleInputSubmit = () => {
    const raw = inputValue.trim();

    // Treat empty input as 0 (remove)
    const newQuantity = raw === "" ? 0 : parseInt(raw, 10);

    if (isNaN(newQuantity) || newQuantity < 0) {
      // Invalid — restore current quantity, do nothing
      setInputValue(String(quantity));
      return;
    }

    if (newQuantity === quantity) {
      // No change
      setInputValue(String(quantity));
      Keyboard.dismiss();
      return;
    }

    if (token) {
      const delta = newQuantity - quantity;

      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          onAddToCart?.();
        }
      } else {
        for (let i = 0; i < Math.abs(delta); i++) {
          onRemoveAddToCart?.();
        }
      }
    } else {
      if (newQuantity === 0) {
        removeItem(variationid);
      } else {
        updateQuantity(variationid, newQuantity);
      }
    }

    Keyboard.dismiss();
  };

  const handlePress = () => {
    imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      router.push({
        pathname: "/productdetails",
        params: {
          id: String(variationid),
          title,
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

  const renderPrice = () => {
    const { low, high, minQty } = getPriceRange(item);

    if (wholesaler) {
      return (
        <View className="mt-0.5">
          <View className="flex-row items-baseline flex-wrap gap-0.5">
            <Text className="text-slate-900 font-extrabold text-sm font-inter">
              Rs. {low}
            </Text>
            <Text className="text-slate-400 text-xs"> - </Text>
            <Text className="text-slate-900 font-extrabold text-sm font-inter">
              Rs. {high}
            </Text>
          </View>
          <Text className="text-slate-400 text-[10px] font-medium mt-0.5">
            Min. qty {minQty}
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-row items-center">
        <Text className="text-slate-900 font-extrabold text-sm font-inter">
          Rs. {low}
        </Text>
        {item?.original_price && (
          <Text className="text-slate-400 line-through text-xxs ml-2 font-inter">
            Rs. {item?.original_price}
          </Text>
        )}
      </View>
    );
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

              <Animated.View key={quantity} entering={ZoomIn.duration(200)}>
                <TextInput
                  ref={inputRef}
                  value={inputValue}
                  onChangeText={handleInputChange}
                  onBlur={handleInputSubmit}
                  onSubmitEditing={handleInputSubmit}
                  keyboardType="numeric"
                  selectTextOnFocus
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 14,
                    padding: 0,
                    margin: 0,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                />
              </Animated.View>

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
        {!wholesaler && item?.discount_type === "percentage" && (
          <Text className="text-green text-xs font-bold uppercase">
            {`${parseInt(String(item?.discount_percentage)) || 0}% OFF`}
          </Text>
        )}

        {renderPrice()}

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
