import Container from "@/components/common/Container";
import ProductCarousel from "@/components/common/ProductCarousel";
import { useAuthStore } from "@/store/useAuth";
import { router } from "expo-router";
import { ChevronRight, MapPin, ScanQrCode, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useCustomerAddress } from "../address/hooks";
import { useAddressStore, useHasAddress } from "../address/store";
import { useActiveAddress } from "../address/store/useActiveAddress";
import {
  useAddtoCart,
  useAddtoCartList,
  useRemoveAddtoCart,
} from "../cart/hooks";
import { useGuestCartStore } from "../cart/store/GuestCartItem";
import { useGetUserDetails } from "../profile/hooks";
import CategoryTabs from "./component/CategoryTabItem";
import FloatingCart from "./component/FloatingCart";
import HomePageBanner from "./component/HomePageBanner";
import { home_tab } from "./const";
import { useHomePageProductList, useUserRecommendationList } from "./hooks";

const SEARCH_HEIGHT = 70;
const CATEGORY_HEIGHT = 60;

export default function Home() {
  const token = useAuthStore((s) => s.token);

  const skipped = useAddressStore((s) => s.skipped);
  const hasLocalAddress = useHasAddress();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("all");
  const address = useActiveAddress();

  const scrollY = useSharedValue(0);

  const { data: RecommendationProduct, isLoading: isRecommendationPending } =
    useUserRecommendationList();

  const { data: ProductList, isLoading: isProductsPending } =
    useHomePageProductList(activeTab);

  const { data: AddToCArtList, isLoading: isAddToCArtListPending } =
    useAddtoCartList();

  const { mutate: addToCart } = useAddtoCart();
  const { mutate: removeAddToCart } = useRemoveAddtoCart();

  const { data: userDetails, isPending } = useGetUserDetails();

  const { data: apiRes, isLoading: apiLoading } = useCustomerAddress();

  const hasServerAddress =
    !!token && !!apiRes?.address && apiRes.address.length > 0;

  const hasAddress = !!token ? hasServerAddress : hasLocalAddress;

  useEffect(() => {
    if (apiLoading) return;
    if (!hasAddress && !skipped) {
      router.replace("/address");
    }
  }, [hasAddress, skipped, apiLoading]);

  const guestItemCount = useGuestCartStore((s) => s.items.length);

  const showCart = token
    ? (AddToCArtList?.data?.length ?? 0) > 0
    : guestItemCount > 0;

  const handleCategoryChange = (index: number) => {
    setActiveIndex(index);
    setActiveTab(home_tab[index].id);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SEARCH_HEIGHT + CATEGORY_HEIGHT],
      [0, -SEARCH_HEIGHT],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
    };
  });

  const deliveryInfoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SEARCH_HEIGHT * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle={"dark-content"} />

      <Animated.View
        className="absolute left-0 right-0 bg-[#FFEDD4] z-50"
        style={[stickyHeaderStyle]}
      >
        <Animated.View
          style={deliveryInfoStyle}
          className="flex-row items-center justify-between px-4 pt-4 pb-2"
        >
          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <MapPin size={14} color="gray" fill="gray" />
              <Text className="ml-1.5 text-xs font-bold tracking-widest text-gray-500">
                DELIVER TO
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router?.navigate("/myaddress");
              }}
            >
              <Text
                className="text-sm font-semibold text-gray-700"
                numberOfLines={1}
              >
                {address?.address
                  ? address.address.length > 36
                    ? `${address.address.substring(0, 36)}...`
                    : address.address
                  : "No address set"}
              </Text>
            </TouchableOpacity>
          </View>
          {token ? (
            <TouchableOpacity onPress={() => router?.navigate("/profile")}>
              <Image
                className="w-9 h-9 rounded-full"
                source={{ uri: `${userDetails?.data?.image}` }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router?.navigate("/login")}>
              <Text>Login</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View className="p-4 pb-1">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() =>
                router.navigate("/(app)/(tabs)/(home)/productsearch")
              }
              className="flex-1 flex-row items-center bg-white border border-orange-200 rounded-xl px-4 py-2.5"
            >
              <Search size={16} color="#9CA3AF" />
              <Text className="ml-2 text-gray-400 text-sm flex-1">
                Search products...
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2.5 bg-white rounded-xl border border-orange-100">
              <ScanQrCode size={22} color="#1f2937" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View className="pt-3">
          <CategoryTabs
            categories={home_tab}
            activeIndex={activeIndex}
            onChange={handleCategoryChange}
          />
        </View>
        <View className="bg-white pb-4" />
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 70,
          paddingTop: SEARCH_HEIGHT + CATEGORY_HEIGHT + 70,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        <HomePageBanner />

        <Container className="pt-3">
          {token && (
            <ProductCarousel
              title="Your Go-To Picks"
              subtitle="The ones you keep coming back for"
              showHeader
              moreOption={
                <TouchableOpacity
                  onPress={() => router.navigate("/morepage")}
                  className="bg-white border border-green-600 w-8 h-8 rounded-md items-center justify-center"
                >
                  <ChevronRight size={18} color="#06812F" strokeWidth={2} />
                </TouchableOpacity>
              }
              data={RecommendationProduct?.result?.data || []}
              isLoading={isRecommendationPending}
              gap={5}
              onAddToCart={(id) => addToCart({ variationid: id })}
              onRemoveAddToCart={(id) => removeAddToCart({ variationid: id })}
            />
          )}

          <View className="pt-4">
            <ProductCarousel
              title="Just In"
              subtitle="Be the first to try them"
              showHeader
              moreOption={
                <TouchableOpacity className="border border-slate-200 px-3 py-1.5 rounded-full">
                  <Text className="text-slate-500 text-xs">View All</Text>
                </TouchableOpacity>
              }
              data={ProductList?.result?.data || []}
              isLoading={isProductsPending}
              gap={10}
              onAddToCart={(id) => addToCart({ variationid: id })}
              onRemoveAddToCart={(id) => removeAddToCart({ variationid: id })}
            />
          </View>

          <View className="h-28 my-4 rounded-md overflow-hidden">
            <Image
              source={{
                uri: "https://www.shutterstock.com/image-vector/super-sale-promotional-banner-promo-600nw-2570295095.jpg",
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>

          <ProductCarousel
            title="Organically grown fruits & Veggies"
            subtitle="Fresh from local farms"
            showHeader
            moreOption={
              <TouchableOpacity className="bg-white border border-green-600 w-8 h-8 rounded-md items-center justify-center">
                <ChevronRight size={18} color="#06812F" strokeWidth={2} />
              </TouchableOpacity>
            }
            data={ProductList?.result?.data || []}
            isLoading={isProductsPending}
            gap={5}
            onAddToCart={(id) => addToCart({ variationid: id })}
            onRemoveAddToCart={(id) => removeAddToCart({ variationid: id })}
          />

          <View className="h-28 my-4 rounded-md overflow-hidden">
            <Image
              source={{
                uri: "https://i.pinimg.com/736x/c2/40/b5/c240b5d24e6161f2a4a3619da5307f7b.jpg",
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
        </Container>
      </Animated.ScrollView>

      {showCart && <FloatingCart data={AddToCArtList?.data || []} />}
    </View>
  );
}
