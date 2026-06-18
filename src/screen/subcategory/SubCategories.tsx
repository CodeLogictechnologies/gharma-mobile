import ProductGrid from "@/components/common/ProductGrid";
import { useAuthStore } from "@/store/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  Search,
  Share2,
  SlidersHorizontal,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useActiveAddress } from "../address/store/useActiveAddress";
import { useAddtoCart, useAddtoCartList } from "../cart/hooks";
import { useGuestCartStore } from "../cart/store/GuestCartItem";
import FloatingCart from "../home/component/FloatingCart";
import { useHomePageProductList } from "../home/hooks";
import { SubCategorySkeleton } from "./component/SubCategorySkeleton";
import { useGetSubCatrgoryList } from "./hooks";

const SubCategories = () => {
  const address = useActiveAddress();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [refreshing, setRefreshing] = useState(false);
  const { categoryTitle, categoryId } = useLocalSearchParams<{
    categoryTitle: string;
    categoryId: string;
  }>();

  console.log("categoryId", categoryId);

  const {
    data: subcategory,
    isLoading: isSubCategoryPending,
    refetch: refetchSubCategory,
  } = useGetSubCatrgoryList(categoryId);

  const [activeSubCategoryTab, setActiveSubCategoryTab] = useState(() => {
    return subcategory?.result?.[0]?.id ?? "";
  });

  useEffect(() => {
    if (
      subcategory?.result &&
      subcategory.result.length > 0 &&
      !activeSubCategoryTab
    ) {
      setActiveSubCategoryTab(subcategory.result[0].id);
    }
  }, [subcategory?.result]);

  const hasSubCategories = subcategory?.result && subcategory.result.length > 1;

  const {
    data: ProductListPages,
    isLoading: isProductsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchProducts,
  } = useHomePageProductList({
    subcategory_id: activeSubCategoryTab,
    category_id: categoryId,
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
    const promises: Promise<unknown>[] = [refetchProducts()];
    if (categoryId) {
      promises.push(refetchSubCategory());
    }
    await Promise.all(promises);
    setRefreshing(false);
  }, [refetchProducts, refetchSubCategory, categoryId]);

  const { data: AddToCArtList } = useAddtoCartList();

  // Single hook for both add (+1) and remove (-1)
  const { mutate: addToCart } = useAddtoCart();

  const guestItemCount = useGuestCartStore((s) => s.items.length);

  const showCart = token
    ? (AddToCArtList?.data?.length ?? 0) > 0
    : guestItemCount > 0;

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white px-4 pt-3 pb-2 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
            <ArrowLeft size={20} />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-[#1c1c1c]">
              {categoryTitle || "Vegetables & Fruits"}
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
        <View className="flex-row gap-4">
          <TouchableOpacity>
            <Search size={22} color="#1c1c1c" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Share2 size={22} color="#1c1c1c" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="border-b border-gray-100 px-4 py-2 flex-row gap-2 bg-white">
        <TouchableOpacity className="flex-row items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5">
          <SlidersHorizontal size={14} color="#4b5563" />
          <Text className="text-xs font-semibold text-gray-700 ml-1.5">
            Filters
          </Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5">
          <Text className="text-xs font-semibold text-gray-700">Sort</Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5">
          <Text className="text-xs font-semibold text-gray-700">Type</Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5">
          <Text className="text-xs font-semibold text-gray-700">Price</Text>
          <ChevronDown size={12} color="#4b5563" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-row mb-8">
        {hasSubCategories && (
          <View className="w-[18%] bg-white border-r border-gray-100 mb-12">
            <ScrollView showsVerticalScrollIndicator={false}>
              {isSubCategoryPending
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <SubCategorySkeleton key={idx} />
                  ))
                : subcategory?.result.map((item) => {
                    const isActive = activeSubCategoryTab === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setActiveSubCategoryTab(item.id)}
                        className={`items-center py-4 px-1 relative ${isActive ? "bg-white" : ""}`}
                      >
                        {isActive && (
                          <View className="absolute left-0 top-0 bottom-0 w-1 bg-yellow" />
                        )}
                        <View className="w-12 h-12 bg-white items-center justify-center p-1 mb-1">
                          <Image
                            source={{ uri: item?.image }}
                            className="w-full h-full"
                            resizeMode="contain"
                          />
                        </View>
                        <Text
                          className={`text-[10px] text-center font-medium px-1 ${isActive ? "text-black font-bold" : "text-gray-500"}`}
                        >
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
            </ScrollView>
          </View>
        )}

        <View
          className={`flex-1 bg-white p-2 ${!hasSubCategories ? "w-full" : ""}`}
        >
          <ProductGrid
            products={flatProductList || []}
            numColumns={3}
            isLoading={isProductsPending}
            cardWidth={95}
            onAddToCart={(id) => addToCart(id, 1)}
            onRemoveAddToCart={(id) => addToCart(id, -1)}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#06812f" />
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

export default SubCategories;
