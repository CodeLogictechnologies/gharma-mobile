import ProductGrid from "@/components/common/ProductGrid";
import {
  useSearchPageProductList,
  useUserRecommendationList,
} from "@/features/home/hooks";
import { ProductItem, RecommendationData } from "@/features/home/types";
import { useProductSearchWords } from "@/features/productsearch/hooks";
import useDebounce from "@/hooks/useDebounce";
import { router } from "expo-router";
import { ChevronLeft, Search, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

const mapRecommendationToProductItem = (
  item: RecommendationData,
): ProductItem => ({
  productid: item.item_id,
  variationid: item.variation_id,
  title: item.title,
  images: item.images ?? [],
  price: item.price,
  discount_type: null,
  discount_value: null,
  discount_percentage: null,
  original_price: null,
});

const MorePage = () => {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const inputRef = useRef<TextInput>(null);

  const { data: searchResults, isLoading: isSearchLoading } =
    useSearchPageProductList(debouncedSearch);
  const products = searchResults?.result?.data ?? [];

  const { data: searchedWords, isPending: isSearchedWordsPending } =
    useProductSearchWords();

  const {
    data,
    isPending: isRecommendationPending,
    fetchNextPage,
    hasNextPage,
  } = useUserRecommendationList({ tab_id: "" });

  const RecommendationProduct: ProductItem[] =
    data?.pages
      ?.flatMap((page) => page.result?.data ?? [])
      ?.map(mapRecommendationToProductItem) ?? [];

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    inputRef.current?.blur();
    setSearch("");
    setIsSearchOpen(false);
  };

  return (
    <ScrollView
      className="px-4 py-2 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        layout={LinearTransition.springify().mass(0.8)}
        className="flex-row items-center justify-between h-12"
      >
        {!isSearchOpen && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="flex-row items-center"
          >
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <ChevronLeft size={22} color="#0f172a" strokeWidth={2} />
            </TouchableOpacity>
            <Text className="text-lg font-inter-bold text-slate-900">
              Just In
            </Text>
          </Animated.View>
        )}

        {isSearchOpen && (
          <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(180)}
            layout={LinearTransition.springify().mass(0.8)}
            className="flex-1 flex-row items-center bg-white border border-primary/50 rounded-3xl px-3 h-10"
          >
            <Search size={15} color="#737373" strokeWidth={2} />

            <TextInput
              ref={inputRef}
              placeholder="Search..."
              placeholderTextColor="#737373"
              className="flex-1 text-slate-800 text-[13px] px-2 h-full"
              value={search}
              onChangeText={setSearch}
            />

            <Animated.View
              entering={ZoomIn.duration(200)}
              exiting={ZoomOut.duration(150)}
            >
              <TouchableOpacity onPress={closeSearch} hitSlop={8}>
                <X size={16} color="#737373" strokeWidth={2.5} />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}

        {!isSearchOpen && (
          <Animated.View
            entering={ZoomIn.duration(200)}
            exiting={ZoomOut.duration(150)}
          >
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              activeOpacity={0.7}
              onPress={openSearch}
            >
              <Search size={20} color="#737373" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {search.length === 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
        >
          <Text className="text-xs text-slate-400 font-medium mt-3">
            {RecommendationProduct.length} Results Found
          </Text>
          <ProductGrid
            products={RecommendationProduct}
            numColumns={3}
            isLoading={isRecommendationPending}
            onAddToCart={() => console.log("")}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.3}
          />
        </Animated.View>
      )}

      {search.length > 0 && products.length > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
        >
          <View className="mt-3 bg-white">
            {products.slice(0, 5).map((item, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.delay(index * 50).duration(200)}
              >
                <TouchableOpacity
                  onPress={() => setSearch(item.title)}
                  activeOpacity={0.7}
                  className="flex-row items-center py-2.5"
                >
                  <Search size={12} color="#737373" strokeWidth={1.5} />
                  <Text className="text-slate-600 ml-3 text-xs">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Text className="font-inter-semibold text-sm text-slate-900 mt-3">
            Showing results for "{search}"
          </Text>

          <ProductGrid
            products={products || []}
            numColumns={3}
            isLoading={isSearchLoading}
            onAddToCart={() => console.log("")}
          />
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default MorePage;
