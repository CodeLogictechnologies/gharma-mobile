import ProductGrid from "@/components/common/ProductGrid";
import { useAddtoCart } from "@/features/cart/hooks";
import { usePromotionItems } from "@/features/promotion/hooks";
import type { PromotionAppliesTo } from "@/features/promotion/types";
import type { ProductItem } from "@/types/product";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useMemo } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Promotion() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    promotionId: string;
    title?: string;
    appliesTo?: string;
    image?: string;
    bgColor?: string;
  }>();

  const promotionId = params.promotionId ?? "";
  const title = params.title ?? "Offer";
  const appliesTo: PromotionAppliesTo =
    params.appliesTo === "category" ? "category" : "item";
  const bannerImage = params.image || null;
  const bgColor = params.bgColor || "#F4F4F4";

  const { mutate: addToCart } = useAddtoCart();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePromotionItems({ promotionId, appliesTo });

  const products: ProductItem[] = useMemo(
    () =>
      (data?.pages.flatMap((page) => page.result.data) ??
        []) as unknown as ProductItem[],
    [data],
  );

  const BannerHeader = bannerImage ? (
    <View
      className="rounded-2xl overflow-hidden mb-3 mt-3"
      style={{ backgroundColor: bgColor }}
    >
      <Image
        source={{ uri: bannerImage }}
        className="w-full h-36"
        resizeMode="cover"
      />
    </View>
  ) : undefined;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(app)/(tabs)/(home)")
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-8 h-8 items-center justify-center"
        >
          <ChevronLeft size={22} color="#1f2937" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center text-base font-inter-bold text-slate-900 mr-8"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <View className="flex-1 px-4">
        <ProductGrid
          numColumns={3}
          products={products}
          isLoading={isLoading && products.length === 0}
          onEndReached={() =>
            hasNextPage && !isFetchingNextPage && fetchNextPage()
          }
          onAddToCart={(id) => addToCart(id, 1)}
          onRemoveAddToCart={(id) => addToCart(id, -1)}
          onRefresh={refetch}
          refreshing={isLoading}
          emptyMessage="No products in this offer yet"
          ListHeaderComponent={BannerHeader}
        />
      </View>
    </View>
  );
}
