import { useCartQuantity } from "@/hooks/useCartQuantity";
import { useStableCallback } from "@/hooks/useStableCallback";
import React, { memo, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native";

import { ProductItem } from "@/types/product";
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

interface CarouselCellProps {
  item: ProductItem;
  quantity: number;
  onAdd?: (variationId: string | number) => void;
  onRemove?: (variationId: string | number) => void;
}

const CarouselCell = memo(
  ({ item, quantity, onAdd, onRemove }: CarouselCellProps) => (
    <ProductCard
      item={item}
      quantity={quantity}
      onAddToCart={onAdd ? () => onAdd(item.variationid) : undefined}
      onRemoveAddToCart={onRemove ? () => onRemove(item.variationid) : undefined}
    />
  ),
);
CarouselCell.displayName = "CarouselCell";

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
  const getQuantity = useCartQuantity();
  const stableAdd = useStableCallback(onAddToCart);
  const stableRemove = useStableCallback(onRemoveAddToCart);

  const renderItem: ListRenderItem<ProductItem> = useCallback(
    ({ item }) => (
      <CarouselCell
        item={item}
        quantity={getQuantity(item.variationid)}
        onAdd={onAddToCart ? stableAdd : undefined}
        onRemove={onRemoveAddToCart ? stableRemove : undefined}
      />
    ),
    [getQuantity, onAddToCart, onRemoveAddToCart, stableAdd, stableRemove],
  );

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
              <ActivityIndicator size="small" color="#d7a11b" />
            </View>
          ) : null
        }
        renderItem={renderItem}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
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
        {title && (
          <Text className="text-base font-inter-bold text-slate-900">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {moreOption ? (
        moreOption
      ) : onMore ? (
        <TouchableOpacity
          onPress={onMore}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="border border-slate-200 px-3 py-1.5 rounded-full"
        >
          <Text className="text-slate-600 text-xs font-inter-semibold">
            View All
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
