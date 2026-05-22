import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import ProductCard from "./ProductCard";

export interface ProductItem {
  variationid: string | number;
  productid: string | number;
  images: string[] | string;
  title: string;
  price: number | string;
  oldPrice?: number | string;
  discount?: string | number;
}

interface ProductGridProps {
  products: ProductItem[] | any;
  numColumns?: number;
  onAddToCart?: (item: ProductItem) => void;

  isLoading?: boolean;
  emptyMessage?: string;

  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
}

const COLUMN_GAP = 12;

const ProductGrid = ({
  products,
  numColumns = 2,
  onAddToCart,
  isLoading = false,
  emptyMessage = "No products found.",
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
}: ProductGridProps) => {
  const renderItem: ListRenderItem<ProductItem> = ({ item, index }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
    return (
      <View
        style={{
          flex: 1,
          marginRight: isLastInRow ? 0 : COLUMN_GAP,
          marginBottom: COLUMN_GAP,
        }}
      >
        <ProductCard
          isGrid={true}
          {...item}
          onAddToCart={() => onAddToCart?.(item)}
          onRemoveAddToCart={() => {}}
        />
      </View>
    );
  };

  const EmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#06812f" />
        </View>
      );
    }
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
      data={products}
      keyExtractor={(item) => String(item.variationid)}
      renderItem={renderItem}
      numColumns={numColumns}
      key={numColumns}
      contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: 32,
        flexGrow: 1,
      }}
      columnWrapperStyle={numColumns > 1 ? { gap: 0 } : undefined}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={<FooterComponent />}
      ListEmptyComponent={<EmptyComponent />}
    />
  );
};

export default ProductGrid;
