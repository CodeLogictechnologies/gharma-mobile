import ProductGrid from "@/components/common/ProductGrid";
import { useActiveAddress } from "@/features/address/store/useActiveAddress";
import { useAddtoCart, useAddtoCartList } from "@/features/cart/hooks";
import { useGuestCartStore } from "@/features/cart/store/GuestCartItem";
import FloatingCart from "@/features/home/components/FloatingCart";
import { useHomePageProductList } from "@/features/home/hooks";
import { useAuthStore } from "@/store/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const BrandProducts = () => {
  const address = useActiveAddress();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [refreshing, setRefreshing] = useState(false);
  const { brandName, brandId } = useLocalSearchParams<{
    brandName: string;
    brandId: string;
  }>();

  const {
    data: ProductListPages,
    isLoading: isProductsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchProducts,
  } = useHomePageProductList({
    brand_id: brandId,
  });

  const flatProductList = useMemo(
    () => ProductListPages?.pages.flatMap((p) => p.result?.data ?? []) ?? [],
    [ProductListPages],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchProducts();
    setRefreshing(false);
  }, [refetchProducts]);

  const { data: AddToCArtList } = useAddtoCartList();

  const { mutate: addToCart } = useAddtoCart();

  const guestItemCount = useGuestCartStore((s) => s.items.length);

  const showCart = token
    ? (AddToCArtList?.data?.length ?? 0) > 0
    : guestItemCount > 0;

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white px-4 pt-3 pb-2 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-1 mr-2"
          >
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-[#1c1c1c]">
              {brandName || "Brand"}
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router?.navigate("/myaddress")}
            >
              <Text className="text-xs text-yellow font-semibold">
                Delivering to :
              </Text>
              <Text className="text-xs text-gray-600 font-medium">
                {address?.address
                  ? address.address.length > 20
                    ? `${address.address.substring(0, 20)}...`
                    : address.address
                  : "No address set"}
              </Text>
              <ChevronDown
                size={14}
                color="#4b5563"
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* <View className="border-b border-gray-100 px-4 py-2 flex-row gap-2 bg-white">
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center border border-gray-200 bg-gray-50 rounded-full px-3 py-1.5"
        >
          <SlidersHorizontal size={14} color="#4b5563" />
          <Text className="text-xs font-semibold text-gray-700 ml-1.5">
            Filters
          </Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center border border-gray-200 bg-gray-50 rounded-full px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-gray-700">Sort</Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center border border-gray-200 bg-gray-50 rounded-full px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-gray-700">Type</Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center border border-gray-200 bg-gray-50 rounded-full px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-gray-700">Price</Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View> */}

      <View className="flex-1 mb-8">
        <View className="flex-1 bg-white p-2">
          <ProductGrid
            products={flatProductList || []}
            numColumns={3}
            isLoading={isProductsPending}
            cardWidth={95}
            emptyMessage={`No products found for ${brandName || "this brand"}`}
            onAddToCart={(id) => addToCart(id, 1)}
            onRemoveAddToCart={(id) => addToCart(id, -1)}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#d7a11b" />
                </View>
              ) : undefined
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      </View>

      {showCart && <FloatingCart data={AddToCArtList?.data || []} />}
    </View>
  );
};

export default BrandProducts;
