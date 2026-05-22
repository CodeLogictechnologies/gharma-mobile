import ProductGrid from "@/components/common/ProductGrid";
import useDebounce from "@/hooks/useDebounce";
import {
  useSearchPageProductList,
  useUserRecommendationList,
} from "@/screen/home/hooks";
import { useProductSearchWords } from "@/screen/productsearch/hooks";
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
import { SafeAreaView } from "react-native-safe-area-context";

const morepage = () => {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const inputRef = useRef<TextInput>(null);

  const { data: searchResults, isLoading: isSearchLoading } =
    useSearchPageProductList(debouncedSearch);
  const products = searchResults?.result?.data ?? [];

  const { data: searchedWords, isPending: isSearchedWordsPending } =
    useProductSearchWords();

  const { data: RecommendationProduct, isPending: isRecommendationPending } =
    useUserRecommendationList();

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
    <SafeAreaView className="flex-1 bg-white">
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
                onPress={() => router.back()}
              >
                <ChevronLeft size={22} color="black" strokeWidth={2} />
              </TouchableOpacity>
              <Text>Just In</Text>
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
            <Text className="font-normal text-xs mt-3">132 Results Found</Text>
            <ProductGrid
              products={RecommendationProduct?.result?.data || []}
              numColumns={3}
              isLoading={isRecommendationPending}
              onAddToCart={() => console.log("")}
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
                    className="flex-row items-center py-1.5"
                  >
                    <Search size={10} color="#737373" strokeWidth={1.5} />
                    <Text className="text-slate-600 ml-3 text-xs">
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <Text className="font-medium text-sm mt-3">
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
    </SafeAreaView>
  );
};

export default morepage;
