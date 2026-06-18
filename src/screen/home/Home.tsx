import Container from "@/components/common/Container";
import ProductCarousel from "@/components/common/ProductCarousel";
import { useAuthStore } from "@/store/useAuth";
import { useNotificationStore } from "@/store/useNotificationStore";
import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  MapPin,
  ScanQrCode,
  Search,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useActiveAddress } from "../address/store/useActiveAddress";
import { useAddtoCart, useAddtoCartList } from "../cart/hooks";
import { useGuestCartStore } from "../cart/store/GuestCartItem";
import { useGetUserDetails } from "../profile/hooks";
import CategoryTabs from "./component/CategoryTabItem";
import FloatingCart from "./component/FloatingCart";
import HomePageBanner from "./component/HomePageBanner";
import {
  useHomePageProductList,
  useHomeTabList,
  useUserRecommendationList,
} from "./hooks";

const SEARCH_HEIGHT = 70;
const CATEGORY_HEIGHT = 60;
const DEFAULT_HEADER_COLOR = "#FFEDD4";

export default function Home() {
  const token = useAuthStore((s) => s.token);
  const { fcmToken } = useNotificationStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("");
  const [headerColor, setHeaderColor] = useState(DEFAULT_HEADER_COLOR);
  const [refreshing, setRefreshing] = useState(false);

  const address = useActiveAddress();

  const { data: HomeTabList, isLoading: isTabsLoading } = useHomeTabList();
  const tabs = HomeTabList?.result ?? [];

  const scrollY = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  const fromColor = useSharedValue(DEFAULT_HEADER_COLOR);
  const toColor = useSharedValue(DEFAULT_HEADER_COLOR);

  const { data: AddToCArtList, refetch: refetchCart } = useAddtoCartList();
  const { refetch: refetchUserDetails } = useGetUserDetails();

  const {
    data: recommendationData,
    fetchNextPage: fetchNextRecommendation,
    hasNextPage: hasNextRecommendation,
    isFetchingNextPage: isFetchingNextRecommendation,
    isLoading: isRecommendationLoading,
    refetch: refetchRecommendation,
  } = useUserRecommendationList({ tab_id: activeTab });

  const flatRecommendationData = useMemo(
    () => recommendationData?.pages.flatMap((page) => page.result.data) ?? [],
    [recommendationData],
  );

  const {
    data: ProductListPages,
    isLoading: isProductsPending,
    fetchNextPage: fetchNextProduct,
    hasNextPage: hasNextProduct,
    isFetchingNextPage: isFetchingNextProduct,
    refetch: refetchProducts,
  } = useHomePageProductList({ tab_id: activeTab });

  const flatProductList = useMemo(
    () => ProductListPages?.pages.flatMap((p) => p.result?.data ?? []) ?? [],
    [ProductListPages],
  );

  // Single hook handles both add (+1) and remove (-1)
  const { mutate: addToCart } = useAddtoCart();

  const guestItemCount = useGuestCartStore((s) => s.items.length);
  const showCart = token
    ? (AddToCArtList?.data?.length ?? 0) > 0
    : guestItemCount > 0;

  const handleCategoryChange = useCallback(
    (index: number, tabId: string) => {
      const raw = tabs[index]?.bg_color ?? DEFAULT_HEADER_COLOR;
      const next =
        !raw || raw === "#ffffff" || raw === "#fff"
          ? DEFAULT_HEADER_COLOR
          : raw;

      fromColor.value = headerColor;
      toColor.value = next;
      colorProgress.value = 0;
      colorProgress.value = withTiming(1, { duration: 400 });

      setHeaderColor(next);
      setActiveIndex(index);
      setActiveTab(tabId);
    },
    [tabs, headerColor],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const promises: Promise<unknown>[] = [
      refetchProducts(),
      refetchRecommendation(),
      refetchCart(),
    ];
    if (token) promises.push(refetchUserDetails());
    await Promise.all(promises);
    setRefreshing(false);
  }, [
    refetchProducts,
    refetchRecommendation,
    refetchCart,
    refetchUserDetails,
    token,
  ]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const stickyHeaderStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, SEARCH_HEIGHT + CATEGORY_HEIGHT],
          [0, -SEARCH_HEIGHT],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const deliveryInfoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, SEARCH_HEIGHT * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const animatedHeaderBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      [fromColor.value, toColor.value],
    ),
  }));

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <Animated.View
        className="absolute left-0 right-0 z-50"
        style={[stickyHeaderStyle, animatedHeaderBg]}
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
            <TouchableOpacity onPress={() => router.navigate("/myaddress")}>
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
          <TouchableOpacity>
            <Bell />
          </TouchableOpacity>
        </Animated.View>

        <View className="p-4 pb-1 flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.navigate("/productsearch")}
            className="flex-1 flex-row items-center bg-white border border-orange-200 rounded-xl px-4 py-2.5"
          >
            <Search size={16} color="#9CA3AF" />
            <Text className="ml-2 text-gray-400 text-sm flex-1">
              Search products...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.navigate("/(app)/scan")}
            className="p-2.5 bg-white rounded-xl border border-orange-100"
          >
            <ScanQrCode size={22} color="#1f2937" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View className="pt-3">
          <CategoryTabs
            tabs={tabs}
            isLoading={isTabsLoading}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={SEARCH_HEIGHT + CATEGORY_HEIGHT + 70}
          />
        }
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
              data={flatRecommendationData}
              isLoading={isRecommendationLoading}
              isFetchingMore={isFetchingNextRecommendation}
              onEndReached={() =>
                hasNextRecommendation &&
                !isFetchingNextRecommendation &&
                fetchNextRecommendation()
              }
              gap={5}
              onAddToCart={(id) => addToCart(id, 1)}
              onRemoveAddToCart={(id) => addToCart(id, -1)}
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
              data={flatProductList}
              isLoading={isProductsPending}
              isFetchingMore={isFetchingNextProduct}
              onEndReached={() =>
                hasNextProduct && !isFetchingNextProduct && fetchNextProduct()
              }
              gap={10}
              onAddToCart={(id) => addToCart(id, 1)}
              onRemoveAddToCart={(id) => addToCart(id, -1)}
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
            data={flatProductList}
            isLoading={isProductsPending}
            isFetchingMore={isFetchingNextProduct}
            onEndReached={() =>
              hasNextProduct && !isFetchingNextProduct && fetchNextProduct()
            }
            gap={5}
            onAddToCart={(id) => addToCart(id, 1)}
            onRemoveAddToCart={(id) => addToCart(id, -1)}
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

          <TouchableOpacity
            className="py-5"
            onPress={() => router.navigate("/(driver)")}
          >
            <Text>Driver</Text>
          </TouchableOpacity>
        </Container>
      </Animated.ScrollView>

      {showCart && <FloatingCart data={AddToCArtList?.data || []} />}
    </View>
  );
}
