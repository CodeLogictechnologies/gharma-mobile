import { useAuthStore } from "@/store/useAuth";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAddtoCartList } from "@/screen/cart/hooks";
import { useGuestCartStore } from "@/screen/cart/store/GuestCartItem";
import { ProductItem } from "../../screen/home/types";
import ProductCard from "./ProductCard";
import SkeletonProductCard from "./skeleton/ProductCarouselSkeleton";

interface ProductCarouselProps {
  data: ProductItem[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  onEndReached?: () => void;
  title?: string;
  subtitle?: string;
  onMore?: () => void;
  moreOption?: React.ReactNode;
  showHeader?: boolean;
  onAddToCart?: (variationId: string | number) => void;
  onRemoveAddToCart?: (variationId: string | number) => void;
  gap?: number;
}

const ProductCarousel = ({
  data,
  isLoading = false,
  isFetchingMore = false,
  onEndReached,
  title,
  subtitle,
  onMore,
  moreOption,
  showHeader = true,
  onAddToCart,
  onRemoveAddToCart,
  gap = 10,
}: ProductCarouselProps) => {
  const token = useAuthStore((s) => s.token);
  const { data: cartList } = useAddtoCartList();
  const guestItems = useGuestCartStore((s) => s.items);

  const getQuantity = (variationid: string | number): number => {
    if (token) {
      const item = cartList?.data?.find(
        (c: any) => String(c.variation_id) === String(variationid),
      );
      const qty = item ? Number(item.total_quantity) : 0;
      return isNaN(qty) ? 0 : qty;
    }
    const item = guestItems.find(
      (i) => String(i.variation_id) === String(variationid),
    );
    return item?.quantity ?? 0;
  };

  const header = showHeader ? (
    <ProductCarouselHeader
      title={title}
      subtitle={subtitle}
      moreOption={moreOption}
      onMore={onMore}
    />
  ) : null;

  if (isLoading) {
    return (
      <View>
        {header}
        <FlatList
          data={Array.from({ length: 4 }, (_, i) => i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap }}
          renderItem={() => <SkeletonProductCard />}
          keyExtractor={(item) => `skeleton-${item}`}
        />
      </View>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <View>
      {header}
      <FlatList
        data={data}
        keyExtractor={(item, index) => {
          const id = item?.variationid ?? item?.productid;
          return id ? String(id) : `prod-item-${index}`;
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap }}
        onEndReached={onEndReached}
        onEndReachedThreshold={3}
        ListFooterComponent={
          isFetchingMore ? (
            <View className="w-16 items-center justify-center">
              <ActivityIndicator size="small" color="#06812F" />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            quantity={getQuantity(item.variationid)}
            onAddToCart={
              onAddToCart ? () => onAddToCart(item.variationid) : undefined
            }
            onRemoveAddToCart={
              onRemoveAddToCart
                ? () => onRemoveAddToCart(item.variationid)
                : undefined
            }
          />
        )}
      />
    </View>
  );
};

export default ProductCarousel;

interface ProductCarouselHeaderProps {
  title?: string;
  subtitle?: string;
  moreOption?: React.ReactNode;
  onMore?: () => void;
}

const ProductCarouselHeader = ({
  title,
  subtitle,
  moreOption,
  onMore,
}: ProductCarouselHeaderProps) => {
  if (!title && !subtitle && !moreOption && !onMore) return null;
  return (
    <View className="flex-row justify-between items-center pb-4">
      <View>
        {title && <Text className="text-base font-bold">{title}</Text>}
        {subtitle && <Text className="text-slate-400">{subtitle}</Text>}
      </View>
      {moreOption ? (
        moreOption
      ) : onMore ? (
        <TouchableOpacity
          onPress={onMore}
          className="border border-slate-300 px-3 py-1.5 rounded-full"
        >
          <Text className="text-slate-600 text-xs">View All</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
