import ProductGrid from "@/components/common/ProductGrid";
import useDebounce from "@/hooks/useDebounce";
import {
  useSearchPageProductList,
  useUserRecommendationList,
} from "@/features/home/hooks";
import {
  useProductSearchWords,
  useRemoveSearchWords,
  useSaveSearchWords,
} from "@/features/productsearch/hooks";
import { router } from "expo-router";
import { ChevronLeft, Search, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ProductSearch = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: searchResults, isLoading: isSearchLoading } =
    useSearchPageProductList(debouncedSearch);
  const products = searchResults?.result?.data ?? [];

  const { data: searchedWords } = useProductSearchWords();

  console.log("searchResults", searchResults);
  const { data: RecommendationProduct, isLoading: isRecommendationPending } =
    useUserRecommendationList({ tab_id: "" });

    

  const { mutate: removeSearchMutate } = useRemoveSearchWords();

  const { mutate: saveSearchMutate } = useSaveSearchWords();

  return (
    <ScrollView
      className=" px-4 py-2 bg-white"
      contentContainerStyle={{ flexGrow: 1, backgroundColor: "white" }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center h-11 border border-primary/50 rounded-xl bg-white shadow-sm">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <ChevronLeft size={22} color="black" strokeWidth={2} />
        </TouchableOpacity>

        <TextInput
          placeholder="Search..."
          placeholderTextColor="#737373"
          className="flex-1 h-full text-base text-slate-800 px-2"
          autoFocus={true}
          value={search}
          onChangeText={setSearch}
        />

        <View className="w-10 h-10 items-center justify-center">
          <Search size={20} color="#737373" strokeWidth={2} />
        </View>
      </View>

      {search.length === 0 && (
        <>
          {searchedWords?.recommendations &&
            searchedWords.recommendations.length > 0 && (
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-semibold text-sm text-slate-900 mt-3">
                  Recent Search
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => {
                    removeSearchMutate("all");
                  }}
                >
                  <Text className="font-inter-semibold text-xs text-primary-dark mt-3">
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          <View className="flex-row flex-wrap gap-2 mt-2">
            {searchedWords?.recommendations.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSearch(item.text)}
                activeOpacity={0.7}
                className="flex-row items-center border border-slate-200 bg-slate-50 rounded-full px-2.5 py-1.5 relative"
              >
                <Search size={11} color="#64748b" strokeWidth={2.5} />
                <Text className="text-slate-500 ml-2 font-medium text-xs">
                  {item?.text}
                </Text>
                <TouchableOpacity
                  className="absolute -right-2 -top-3 bg-white p-1 border border-gray-100 rounded-full"
                  onPress={() => {
                    removeSearchMutate(item?.searchid);
                  }}
                >
                  <X size={11} color="#64748b" strokeWidth={2.5} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="font-inter-semibold text-sm text-slate-900 mt-4">
            You might Like
          </Text>
          <ProductGrid
            products={RecommendationProduct?.result?.data || []}
            numColumns={3}
            isLoading={isRecommendationPending}
            onAddToCart={() => {
              console.log("");
            }}
            // onEndReached={fetchNextPage}
            // ListHeaderComponent={<SortFilterBar />}
          />
        </>
      )}

      {search.length > 0 && products.length > 0 && (
        <>
          <View className="mt-3 bg-white">
            {products.slice(0, 5).map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSearch(item.title);
                  saveSearchMutate({ search: item?.title });
                }}
                activeOpacity={0.7}
                className="flex-row items-center py-2.5"
              >
                <Search size={12} color="#737373" strokeWidth={1.5} />
                <Text className="text-slate-600 ml-3 text-xs">
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="font-inter-semibold text-sm text-slate-900 mt-3">
            Showing results for “{search}”
          </Text>
          <ProductGrid
            products={products || []}
            numColumns={3}
            isLoading={isRecommendationPending}
            onAddToCart={() => {
              console.log("");
            }}
            // onEndReached={fetchNextPage}
            // ListHeaderComponent={<SortFilterBar />}
          />
        </>
      )}

      {search.length > 0 && !isSearchLoading && products.length === 0 && (
        <View className="flex-1 items-center justify-center py-20">
          <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
            <Search size={26} color="#94a3b8" strokeWidth={1.8} />
          </View>
          <Text className="text-slate-600 text-sm font-inter-semibold">
            No results for “{search}”
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Check the spelling or try a different keyword
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ProductSearch;
