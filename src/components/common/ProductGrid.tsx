import { useAuthStore } from "@/store/useAuth";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  type ListRenderItem,
} from "react-native";

import { useAddtoCartList } from "@/screen/cart/hooks";
import { useGuestCartStore } from "@/screen/cart/store/GuestCartItem";
import { ProductItem } from "../../screen/home/types"; // adjust path as needed
import ProductCard from "./ProductCard";
import SkeletonProductCard from "./skeleton/ProductCarouselSkeleton";

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

  const skeletonData: ProductItem[] = isLoading
    ? Array.from({ length: numColumns * 3 }, (_, i) => ({
        variationid: `skeleton-${i}`,
        productid: `skeleton-${i}`,
        images: [],
        title: "",
        variations: [],
        wholesaler_price: [],
      }))
    : [];

  const data = isLoading ? skeletonData : products;

  const renderItem: ListRenderItem<ProductItem> = ({ item, index }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
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
      </View>
    );
  };

  const EmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-slate-400 text-sm font-medium">
          {emptyMessage}
        </Text>
      </View>
    );
  };

  const FooterComponent = () => {
    if (!isLoading || products.length === 0) return ListFooterComponent ?? null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#06812f" />
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
    />
  );
};

export default ProductGrid;
