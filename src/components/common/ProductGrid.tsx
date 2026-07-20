import { useCartQuantity } from "@/hooks/useCartQuantity";
import { useStableCallback } from "@/hooks/useStableCallback";
import React, { memo, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  type ListRenderItem,
} from "react-native";

import { ProductItem } from "@/types/product";
import ProductCard from "./ProductCard";
import SkeletonProductCard from "./skeleton/ProductCarouselSkeleton";
import { ShoppingCart } from "lucide-react-native";

interface ProductGridProps {
  products: ProductItem[];
  numColumns?: number;
  cardWidth?: number;
  onAddToCart?: (variationId: string | number) => void;
  onRemoveAddToCart?: (variationId: string | number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const COLUMN_GAP = 12;

interface GridCellProps {
  item: ProductItem;
  isLastInRow: boolean;
  cardWidth?: number;
  quantity: number;
  onAdd?: (variationId: string | number) => void;
  onRemove?: (variationId: string | number) => void;
}

const GridCell = memo(
  ({ item, isLastInRow, cardWidth, quantity, onAdd, onRemove }: GridCellProps) => {
    const isSkeleton = String(item.variationid).startsWith("skeleton-");

    return (
      <View
        style={{
          flex: 1,
          marginRight: isLastInRow ? 0 : COLUMN_GAP,
          marginBottom: COLUMN_GAP,
        }}
      >
        {isSkeleton ? (
          <SkeletonProductCard width={cardWidth ?? 100} />
        ) : (
          <ProductCard
            item={item}
            isGrid
            cardWidth={cardWidth}
            quantity={quantity}
            onAddToCart={onAdd ? () => onAdd(item.variationid) : undefined}
            onRemoveAddToCart={
              onRemove ? () => onRemove(item.variationid) : undefined
            }
          />
        )}
      </View>
    );
  },
);
GridCell.displayName = "GridCell";

const ProductGrid = ({
  products,
  numColumns = 2,
  cardWidth,
  onAddToCart,
  onRemoveAddToCart,
  isLoading = false,
  emptyMessage = "No products found.",
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
  refreshing = false,
  onRefresh,
}: ProductGridProps) => {
  const getQuantity = useCartQuantity();
  const stableAdd = useStableCallback(onAddToCart);
  const stableRemove = useStableCallback(onRemoveAddToCart);

  const skeletonData: ProductItem[] = useMemo(
    () =>
      isLoading
        ? Array.from({ length: numColumns * 3 }, (_, i) => ({
            variationid: `skeleton-${i}`,
            productid: `skeleton-${i}`,
            title: "",
            images: [],
            variations: [],
            wholesaler_price: [],
            discount_type: null,
            discount_value: null,
            discount_percentage: null,
            original_price: null,
          }))
        : [],
    [isLoading, numColumns],
  );

  const data = isLoading ? skeletonData : products;

  const renderItem: ListRenderItem<ProductItem> = useCallback(
    ({ item, index }) => (
      <GridCell
        item={item}
        isLastInRow={(index + 1) % numColumns === 0}
        cardWidth={cardWidth}
        quantity={getQuantity(item.variationid)}
        onAdd={onAddToCart ? stableAdd : undefined}
        onRemove={onRemoveAddToCart ? stableRemove : undefined}
      />
    ),
    [
      numColumns,
      cardWidth,
      getQuantity,
      onAddToCart,
      onRemoveAddToCart,
      stableAdd,
      stableRemove,
    ],
  );

  const EmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-16">
        <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
          {/* <Text className="text-2xl">🛒</Text> */}
          <ShoppingCart />
        </View>
        <Text className="text-slate-600 text-sm font-inter-semibold">
          {emptyMessage}
        </Text>
        <Text className="text-slate-400 text-xs mt-1">
          Try a different search or category
        </Text>
      </View>
    );
  };

  const FooterComponent = () => {
    if (!isLoading || products.length === 0) return ListFooterComponent ?? null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#d7a11b" />
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.variationid)}
      renderItem={renderItem}
      numColumns={numColumns}
      key={numColumns}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 32, flexGrow: 1 }}
      columnWrapperStyle={numColumns > 1 ? { gap: 0 } : undefined}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={<FooterComponent />}
      ListEmptyComponent={<EmptyComponent />}
      refreshing={refreshing}
      onRefresh={onRefresh}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
    />
  );
};

export default ProductGrid;
