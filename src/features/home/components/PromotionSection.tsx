import ProductCarousel from "@/components/common/ProductCarousel";
import { useAddtoCart } from "@/features/cart/hooks";
import type { ProductItem } from "@/types/product";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useMemo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import type { Promotion, PromotionItem } from "../types";

interface Props {
  promotion: Promotion;
}

function itemDiscountPercent(item: PromotionItem) {
  if (item.discount_type === "percentage" && item.discount_percentage) {
    return Number(item.discount_percentage) || 0;
  }
  const before = Number(item.price_before_discount);
  const after = Number(item.price_after_discount);
  if (before > 0 && after > 0 && before > after) {
    return Math.round((1 - after / before) * 100);
  }
  return 0;
}

export default function PromotionSection({ promotion }: Props) {
  const { mutate: addToCart } = useAddtoCart();

  const products: ProductItem[] = useMemo(
    () =>
      (promotion.items ?? []).map((item) => ({
        ...item,
        images: item.images ?? [],
      })) as unknown as ProductItem[],
    [promotion.items],
  );

  const maxDiscount = useMemo(() => {
    const percentages = (promotion.items ?? [])
      .map(itemDiscountPercent)
      .filter((n) => n > 0);
    return percentages.length ? Math.max(...percentages) : null;
  }, [promotion.items]);

  if (!products.length) return null;

  const handlePress = () => {
    router.navigate({
      pathname: "/promotion",
      params: {
        promotionId: promotion.id,
        title: promotion.name,
        appliesTo: promotion.applies_to,
        image: promotion.image ?? "",
        bgColor: promotion.bg_color ?? "",
      },
    });
  };
  return (
    <View className="mt-5 mx-4 rounded-2xl overflow-hidden bg-white border border-slate-100">
      {promotion.image ? (
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <Image
            source={{ uri: promotion.image }}
            className="w-full h-32"
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        className="flex-row items-center justify-between px-4 pt-3 pb-2"
        // style={{ backgroundColor: promotion.bg_color || "#FFF1E6" }}
      >
        <View className="flex-1 pr-2">
          <Text
            className="text-base font-inter-bold text-slate-900"
            numberOfLines={1}
          >
            {promotion.name}
          </Text>
          {maxDiscount ? (
            <Text className="text-xs font-inter-semibold text-red-700 mt-0.5">
              Up to {maxDiscount}% OFF
            </Text>
          ) : (
            <Text className="text-xs font-inter-medium text-slate-700 mt-0.5">
              Limited time offer
            </Text>
          )}
        </View>

        <View className="flex-row items-center bg-white px-2.5 py-1.5 rounded-full">
          <Text className="text-xs font-inter-semibold text-slate-800 mr-0.5">
            Shop All
          </Text>
          <ChevronRight size={14} color="#1f2937" />
        </View>
      </TouchableOpacity>

      {/* Products */}
      <View className="pt-3 pb-1 px-3">
        <ProductCarousel
          data={products}
          showHeader={false}
          gap={10}
          onAddToCart={(id) => addToCart(id, 1)}
          onRemoveAddToCart={(id) => addToCart(id, -1)}
        />
      </View>
    </View>
  );
}
