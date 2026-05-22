import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import ProductCard from "./ProductCard";
import SkeletonProductCard from "./skeleton/ProductCarouselSkeleton";

interface Product {
  variationid?: string | number;
  variation_id?: string | number;
  productid?: string | number;
  item_id?: string | number;
  images: string[] | string | null;
  title: string;
  price: number | string;
  oldPrice?: number | string;
  discount?: string | number;
}

interface ProductCarouselProps {
  data: Product[];
  isLoading?: boolean;
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
  title,
  subtitle,
  onMore,
  moreOption,
  showHeader = true,
  onAddToCart,
  onRemoveAddToCart,
  gap = 10,
}: ProductCarouselProps) => {
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
          data={Array.from({ length: 4 })}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap }}
          renderItem={() => <SkeletonProductCard />}
          keyExtractor={(_, i) => `skeleton-${i}`}
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
        keyExtractor={(item) =>
          String(
            item.variation_id ??
              item.variationid ??
              item.productid ??
              item.item_id ??
              Math.random(),
          )
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap }}
        renderItem={({ item }) => (
          <ProductCard
            variationid={item.variation_id ?? item.variationid ?? ""}
            productid={item.item_id ?? item.productid ?? ""}
            images={item.images ?? []}
            title={item.title}
            price={item.price}
            oldPrice={item.oldPrice}
            discount={item.discount}
            onAddToCart={
              onAddToCart
                ? () => onAddToCart(item.variation_id ?? item.variationid ?? "")
                : undefined
            }
            onRemoveAddToCart={
              onRemoveAddToCart
                ? () =>
                    onRemoveAddToCart(
                      item.variation_id ?? item.variationid ?? "",
                    )
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
    <>
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
    </>
  );
};
