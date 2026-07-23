import Container from "@/components/common/Container";
import ProductCarousel from "@/components/common/ProductCarousel";
import { useActiveAddress } from "@/features/address/store/useActiveAddress";
import OrderSuccessModal from "@/features/cart/components/OrderSuccessModal";
import { useAddtoCart, useAddtoCartList } from "@/features/cart/hooks";
import { useGuestCartStore } from "@/features/cart/store/GuestCartItem";
import { useGetUserDetails } from "@/features/profile/hooks";
import { shadeHexColor } from "@/libs/shadeHexColor";
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
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useBrandList } from "../brand/hooks";
import { useGetCatrgoryList } from "../category/hooks";
import CategoryTabs from "./components/CategoryTabItem";
import FloatingCart from "./components/FloatingCart";
import HomePageBanner from "./components/HomePageBanner";
import {
  useHomePageProductList,
  useHomeTabList,
  useUserRecommendationList,
} from "./hooks";

const SEARCH_HEIGHT = 70;
const CATEGORY_HEIGHT = 60;
const DEFAULT_HEADER_COLOR = "#FFEDD4";

const SHADE_AMOUNT = 0.5;

export default function Home() {
  const token = useAuthStore((s) => s.token);
  const { fcmToken } = useNotificationStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("");
  const [headerColor, setHeaderColor] = useState(DEFAULT_HEADER_COLOR);
  const [refreshing, setRefreshing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [orderResponse, setOrderResponse] = useState<any>(null);

  const address = useActiveAddress();

  const { data: HomeTabList, isLoading: isTabsLoading } = useHomeTabList();
  const tabs = HomeTabList?.result ?? [];

  const scrollY = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  const fromColor = useSharedValue(DEFAULT_HEADER_COLOR);
  const toColor = useSharedValue(DEFAULT_HEADER_COLOR);

  const fromShade = useSharedValue(
    shadeHexColor(DEFAULT_HEADER_COLOR, SHADE_AMOUNT),
  );
  const toShade = useSharedValue(
    shadeHexColor(DEFAULT_HEADER_COLOR, SHADE_AMOUNT),
  );

  const { data: AddToCArtList, refetch: refetchCart } = useAddtoCartList();
  const { refetch: refetchUserDetails } = useGetUserDetails();

  const { data: categoryData, isPending: isCategoryLoading } =
    useGetCatrgoryList();

  const { data: brandData, isPending: isBrandLoading } = useBrandList();
  const brands = brandData?.data ?? [];

  const {
    data: recommendationData,
    fetchNextPage: fetchNextRecommendation,
    hasNextPage: hasNextRecommendation,
    isFetchingNextPage: isFetchingNextRecommendation,
    isLoading: isRecommendationLoading,
    refetch: refetchRecommendation,
  } = useUserRecommendationList({ tab_id: activeTab });

  const flatRecommendationData = useMemo(
    () =>
      recommendationData?.pages.flatMap((page) =>
        page.result.data
          .map((item) => {
            const raw = item as Record<string, any>;
            return {
              productid: raw.productid ?? raw.item_id ?? "",
              variationid: raw.variationid ?? raw.variation_id ?? "",
              title: raw.title,
              images: raw.images ?? [],
              price: raw.price,
              discount_type: raw.discount_type ?? null,
              discount_value: raw.discount_value ?? null,
              discount_percentage: raw.discount_percentage ?? null,
              original_price: raw.original_price ?? null,
              wholesaler_price: raw.wholesaler_price,
            };
          })
          .filter((p) => p.variationid !== ""),
      ) ?? [],
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

      fromShade.value = shadeHexColor(headerColor, SHADE_AMOUNT);
      toShade.value = shadeHexColor(next, SHADE_AMOUNT);

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
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bell size={22} color="#1f2937" />
          </TouchableOpacity>
        </Animated.View>

        <View className="p-4 pb-1 flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.navigate("/productsearch")}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm"
          >
            <Search size={16} color="#9CA3AF" />
            <Text className="ml-2 text-gray-400 text-sm flex-1">
              Search products...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.navigate("/(app)/scan")}
            activeOpacity={0.8}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <ScanQrCode size={20} color="#1f2937" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View className="pt-3">
          <CategoryTabs
            tabs={tabs}
            isLoading={isTabsLoading}
            activeIndex={activeIndex}
            onChange={handleCategoryChange}
            colorProgress={colorProgress}
            fromShade={fromShade}
            toShade={toShade}
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
            tintColor="#d7a11b"
            colors={["#d7a11b"]}
          />
        }
      >
        <View className="pt-4">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-base font-inter-bold text-slate-900">
              Shop by Category
            </Text>
            <TouchableOpacity
              onPress={() => router.navigate("/(app)/(tabs)/categories")}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text className="text-xs font-inter-semibold text-amber-600">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
          >
            {isCategoryLoading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <View key={idx} className="items-center w-20">
                    <View className="w-20 h-20 rounded-2xl bg-slate-100 mb-2" />
                    <View className="w-14 h-2 rounded-full bg-slate-100" />
                  </View>
                ))
              : categoryData?.categories?.map((item) => (
                  <TouchableOpacity
                    key={item.categoryid}
                    onPress={() =>
                      router.navigate({
                        pathname: "/subcategory",
                        params: {
                          categoryTitle: item.title,
                          categoryId: item.categoryid,
                        },
                      })
                    }
                    activeOpacity={0.7}
                    className="items-center w-20"
                  >
                    <View className="w-20 h-20 rounded-2xl bg-sky-50 items-center justify-center mb-2 p-2">
                      <Image
                        source={{ uri: item.image }}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      className="text-xs text-center font-inter-semibold text-slate-800 leading-4"
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>

        <HomePageBanner />

        <View className="pt-5">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-base font-inter-bold text-slate-900">
              Shop by Brand
            </Text>
            <TouchableOpacity
              onPress={() => router.navigate("/brand")}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text className="text-xs font-inter-semibold text-amber-600">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
          >
            {isBrandLoading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <View key={idx} className="items-center w-20">
                    <View className="w-20 h-20 rounded-xl bg-slate-100 mb-2" />
                    <View className="w-14 h-2 rounded-full bg-slate-100" />
                  </View>
                ))
              : brands.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      router.navigate({
                        pathname: "/brandproducts",
                        params: { brandName: item.name, brandId: item.id },
                      })
                    }
                    activeOpacity={0.7}
                    className="items-center w-20"
                  >
                    <View className="w-20 h-20 rounded-xl bg-slate-50 items-center justify-center mb-2 p-2">
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      className="text-xs text-center font-inter-semibold text-slate-800 leading-4"
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>

        <Container className="pt-5">
          {token && (
            <ProductCarousel
              title="Your Go-To Picks"
              subtitle="The ones you keep coming back for"
              showHeader
              moreOption={
                <TouchableOpacity
                  onPress={() =>
                    router.navigate({
                      pathname: "/morepage",
                      params: {
                        title: "Your Go-To Picks",
                        tab_id: activeTab,
                        source: "recommendation",
                      },
                    })
                  }
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  className="bg-white border border-slate-200 w-8 h-8 rounded-full items-center justify-center"
                >
                  <ChevronRight size={18} color="#475569" strokeWidth={2} />
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
                <TouchableOpacity
                  onPress={() =>
                    router.navigate({
                      pathname: "/morepage",
                      params: {
                        title: "Just In",
                        tab_id: activeTab,
                        source: "products",
                      },
                    })
                  }
                  activeOpacity={0.7}
                  className="border border-slate-200 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-slate-600 text-xs font-inter-semibold">
                    View All
                  </Text>
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

          <View className="h-28 my-4 rounded-xl overflow-hidden">
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
              <TouchableOpacity
                onPress={() =>
                  router.navigate({
                    pathname: "/morepage",
                    params: {
                      title: "Organically grown fruits & Veggies",
                      tab_id: activeTab,
                      source: "products",
                    },
                  })
                }
                activeOpacity={0.7}
                className="bg-white border border-slate-200 w-8 h-8 rounded-full items-center justify-center"
              >
                <ChevronRight size={18} color="#475569" strokeWidth={2} />
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

          <View className="h-28 my-4 rounded-xl overflow-hidden">
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

      {/* {showCart && <FloatingCart data={AddToCArtList?.data || []} />} */}

      <FloatingCart
        data={AddToCArtList?.data || []}
        onOrderSuccess={(data) => {
          setOrderResponse(data);
          setSuccessModalVisible(true);
        }}
      />

      <OrderSuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        orderData={orderResponse}
      />
    </View>
  );
}
