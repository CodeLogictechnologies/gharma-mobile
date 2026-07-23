import ProductCarousel from "@/components/common/ProductCarousel";
import SkeletonProductCard from "@/components/common/skeleton/ProductCarouselSkeleton";
import { useAddtoCart } from "@/features/cart/hooks";
import {
  useRemoveToFavourite,
  useSaveToFavourite,
} from "@/features/favourite/hooks";
import {
  useHomePageProductList,
  useUserRecommendationList,
} from "@/features/home/hooks";
import {
  useProductDetails,
  useSaveRecentlyViewed,
} from "@/features/productdetails/hooks";
import { formatPrice } from "@/libs/formatPrice";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Skeleton } from "heroui-native";
import LottieView from "lottie-react-native";
import { ChevronLeft, Heart, Share2 } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeOutDown,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageViewerModal from "./components/ImageViewer";

const { width } = Dimensions.get("window");
const HEADER_SCROLL_THRESHOLD = 300;
const { width: SCREEN_W } = Dimensions.get("window");
const ANIMATION_DURATION = 350;
const CONTENT_FADE_DELAY = 200;
const STAGGER_DELAY = 50;

const HeartAnimation = require("@/../assets/animations/heart_pop.lottie");

const SkeletonLine = ({
  width: w,
  height = 14,
  style,
}: {
  width: number | string;
  height?: number;
  style?: object;
}) => (
  <Skeleton
    style={[{ width: w, height, borderRadius: 6, marginBottom: 6 }, style]}
    variant="shimmer"
    animation={{ shimmer: { duration: 2000, speed: 1.5 } }}
  />
);

const DescriptionSkeleton = () => (
  <View style={{ marginTop: 8, marginBottom: 4 }}>
    <SkeletonLine width="100%" />
    <SkeletonLine width="90%" />
    <SkeletonLine width="70%" />
  </View>
);

const VariantsSkeleton = () => (
  <View style={{ flexDirection: "row", paddingVertical: 16, gap: 12 }}>
    <Skeleton
      style={{ width: 130, height: 64, borderRadius: 8 }}
      variant="shimmer"
    />
    <Skeleton
      style={{ width: 130, height: 64, borderRadius: 8 }}
      variant="shimmer"
    />
    <Skeleton
      style={{ width: 130, height: 64, borderRadius: 8 }}
      variant="shimmer"
    />
  </View>
);

const CarouselSkeleton = ({ showHeader = true }: { showHeader?: boolean }) => (
  <View style={{ marginBottom: 16 }}>
    {showHeader && (
      <SkeletonLine width={150} height={18} style={{ marginBottom: 8 }} />
    )}
    <View style={{ flexDirection: "row", gap: 10 }}>
      <SkeletonProductCard />
      <SkeletonProductCard />
      <SkeletonProductCard />
    </View>
  </View>
);

const BannerSkeleton = () => (
  <Skeleton
    style={{ width: "100%", height: 112, borderRadius: 8, marginBottom: 16 }}
    variant="shimmer"
    animation={{ shimmer: { duration: 2000, speed: 1.5 } }}
  />
);

const ActionBarSkeleton = () => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    }}
  >
    <View>
      <SkeletonLine width={100} height={12} />
      <SkeletonLine width={80} height={20} />
      <SkeletonLine width={120} height={12} />
    </View>
    <Skeleton
      style={{ width: 100, height: 44, borderRadius: 8 }}
      variant="shimmer"
    />
  </View>
);

const FallbackGallery = ({
  imageUri,
  galleryStyle,
}: {
  imageUri: string;
  galleryStyle: object;
}) => (
  <Animated.View
    style={[{ width, height: "100%", position: "absolute" }, galleryStyle]}
    pointerEvents="none"
  >
    <Image
      source={{ uri: imageUri }}
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
    />
  </Animated.View>
);

const ProductDetails = () => {
  const lottieRef = useRef<LottieView>(null);
  const router = useRouter();
  const {
    id,
    title: paramTitle,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    sourceBorderRadius,
    imageUri,
  } = useLocalSearchParams<{
    id: string;
    title: string;
    sourceX: string;
    sourceY: string;
    sourceWidth: string;
    sourceHeight: string;
    sourceBorderRadius: string;
    imageUri: string;
  }>();

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useSharedValue(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const { data, isLoading } = useProductDetails(`${id}`);
  const product = data?.details;

  const [selectedVariant, setSelectedVariant] = useState<string>(
    product?.variationid?.toString() || "",
  );

  useEffect(() => {
    if (product?.variationid) setSelectedVariant(product.variationid);
  }, [product?.variationid]);

  const selectedVariationData = product?.variations.find(
    (v) => v.variationid === selectedVariant,
  );

  const { mutate: saveRecentlyViewed } = useSaveRecentlyViewed();

  useEffect(() => {
    if (id) {
      saveRecentlyViewed({ variationid: id });
    }
  }, [id, saveRecentlyViewed]);

  const {
    data: ProductListPages,
    isLoading: isProductsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomePageProductList({ tab_id: "" });

  const flatProductList = useMemo(
    () => ProductListPages?.pages.flatMap((p) => p.result?.data ?? []) ?? [],
    [ProductListPages],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { mutate: saveToFav, isPending: isSaving } = useSaveToFavourite();
  const { mutate: removeFromFav, isPending: isRemoving } =
    useRemoveToFavourite();

  const { mutate: addToCart } = useAddtoCart();

  const bgOpacity = useSharedValue(1);
  const progress = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);
  const galleryOpacity = useSharedValue(0);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const descOpacity = useSharedValue(0);
  const descTranslateY = useSharedValue(20);
  const variantsOpacity = useSharedValue(0);
  const variantsTranslateY = useSharedValue(20);
  const carousel1Opacity = useSharedValue(0);
  const carousel1TranslateY = useSharedValue(20);
  const sectionTitleOpacity = useSharedValue(0);
  const sectionTitleTranslateY = useSharedValue(20);
  const carousel2Opacity = useSharedValue(0);
  const carousel2TranslateY = useSharedValue(20);
  const bannersOpacity = useSharedValue(0);
  const bannersTranslateY = useSharedValue(20);

  const backgroundStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: `rgba(255,255,255,${bgOpacity.value})`,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      scrollY.value,
      [HEADER_SCROLL_THRESHOLD - 40, HEADER_SCROLL_THRESHOLD],
      ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
    );
    const borderBottomWidth = interpolate(
      scrollY.value,
      [HEADER_SCROLL_THRESHOLD - 40, HEADER_SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      backgroundColor: bgColor,
      borderBottomWidth,
      borderBottomColor: "#f0f0f0",
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_THRESHOLD, HEADER_SCROLL_THRESHOLD + 30],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const ty = interpolate(
      scrollY.value,
      [HEADER_SCROLL_THRESHOLD, HEADER_SCROLL_THRESHOLD + 30],
      [6, 0],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY: ty }] };
  });

  const iconBtnStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [HEADER_SCROLL_THRESHOLD - 40, HEADER_SCROLL_THRESHOLD],
      ["rgba(255,255,255,0.85)", "rgba(245,245,245,1)"],
    );
    return { backgroundColor, borderRadius: 999 };
  });

  const contentTitleStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_THRESHOLD / 2, HEADER_SCROLL_THRESHOLD],
      [0, 70, 70],
      Extrapolation.CLAMP,
    );
    const ty = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_THRESHOLD, HEADER_SCROLL_THRESHOLD + 30],
      [0, 0, -50],
      Extrapolation.CLAMP,
    );
    const op = interpolate(
      scrollY.value,
      [HEADER_SCROLL_THRESHOLD - 40, HEADER_SCROLL_THRESHOLD],
      [1, 0.8],
      Extrapolation.CLAMP,
    );
    return { transform: [{ translateX }, { translateY: ty }], opacity: op };
  });

  const animatedImageStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: interpolate(progress.value, [0, 1], [Number(sourceY), 0]),
    left: interpolate(progress.value, [0, 1], [Number(sourceX), 0]),
    width: interpolate(progress.value, [0, 1], [Number(sourceWidth), SCREEN_W]),
    height: interpolate(
      progress.value,
      [0, 1],
      [Number(sourceHeight), SCREEN_W],
    ),
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [Number(sourceBorderRadius) || 6, 0],
      Extrapolation.CLAMP,
    ),
    opacity: overlayOpacity.value,
    zIndex: 100,
  }));

  const galleryStyle = useAnimatedStyle(() => ({
    opacity: galleryOpacity.value,
    zIndex: galleryOpacity.value > 0 ? 101 : 0,
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const descAnimStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descTranslateY.value }],
  }));

  const variantsAnimStyle = useAnimatedStyle(() => ({
    opacity: variantsOpacity.value,
    transform: [{ translateY: variantsTranslateY.value }],
  }));

  const carousel1AnimStyle = useAnimatedStyle(() => ({
    opacity: carousel1Opacity.value,
    transform: [{ translateY: carousel1TranslateY.value }],
  }));

  const sectionTitleAnimStyle = useAnimatedStyle(() => ({
    opacity: sectionTitleOpacity.value,
    transform: [{ translateY: sectionTitleTranslateY.value }],
  }));

  const carousel2AnimStyle = useAnimatedStyle(() => ({
    opacity: carousel2Opacity.value,
    transform: [{ translateY: carousel2TranslateY.value }],
  }));

  const bannersAnimStyle = useAnimatedStyle(() => ({
    opacity: bannersOpacity.value,
    transform: [{ translateY: bannersTranslateY.value }],
  }));

  const animateContentEntry = () => {
    const baseDelay = ANIMATION_DURATION + CONTENT_FADE_DELAY;
    titleOpacity.value = withDelay(baseDelay, withTiming(1, { duration: 300 }));
    titleTranslateY.value = withDelay(
      baseDelay,
      withTiming(0, { duration: 300 }),
    );
    descOpacity.value = withDelay(
      baseDelay + STAGGER_DELAY,
      withTiming(1, { duration: 300 }),
    );
    descTranslateY.value = withDelay(
      baseDelay + STAGGER_DELAY,
      withTiming(0, { duration: 300 }),
    );
    variantsOpacity.value = withDelay(
      baseDelay + STAGGER_DELAY * 2,
      withTiming(1, { duration: 300 }),
    );
    variantsTranslateY.value = withDelay(
      baseDelay + STAGGER_DELAY * 2,
      withTiming(0, { duration: 300 }),
    );
    carousel1Opacity.value = withDelay(
      baseDelay + STAGGER_DELAY * 3,
      withTiming(1, { duration: 300 }),
    );
    carousel1TranslateY.value = withDelay(
      baseDelay + STAGGER_DELAY * 3,
      withTiming(0, { duration: 300 }),
    );
    sectionTitleOpacity.value = withDelay(
      baseDelay + STAGGER_DELAY * 4,
      withTiming(1, { duration: 300 }),
    );
    sectionTitleTranslateY.value = withDelay(
      baseDelay + STAGGER_DELAY * 4,
      withTiming(0, { duration: 300 }),
    );
    carousel2Opacity.value = withDelay(
      baseDelay + STAGGER_DELAY * 5,
      withTiming(1, { duration: 300 }),
    );
    carousel2TranslateY.value = withDelay(
      baseDelay + STAGGER_DELAY * 5,
      withTiming(0, { duration: 300 }),
    );
    bannersOpacity.value = withDelay(
      baseDelay + STAGGER_DELAY * 6,
      withTiming(1, { duration: 300 }),
    );
    bannersTranslateY.value = withDelay(
      baseDelay + STAGGER_DELAY * 6,
      withTiming(0, { duration: 300 }),
    );
  };

  useEffect(() => {
    progress.value = withTiming(1, { duration: ANIMATION_DURATION });
    galleryOpacity.value = withDelay(
      ANIMATION_DURATION - 100,
      withTiming(1, { duration: 200 }),
    );
    overlayOpacity.value = withDelay(
      ANIMATION_DURATION + 100,
      withTiming(0, { duration: 200 }, (finished) => {
        if (finished) runOnJS(setIsTransitioning)(false);
      }),
    );
    animateContentEntry();
  }, []);

  const startHeroExit = () => {
    progress.value = withTiming(
      0,
      { duration: ANIMATION_DURATION },
      (finished) => {
        if (finished) runOnJS(router.back)();
      },
    );
  };

  const startContentExit = () => {
    titleOpacity.value = withTiming(0, { duration: 150 });
    titleTranslateY.value = withTiming(-10, { duration: 150 });
    descOpacity.value = withTiming(0, { duration: 150 });
    descTranslateY.value = withTiming(-10, { duration: 150 });
    variantsOpacity.value = withTiming(0, { duration: 150 });
    variantsTranslateY.value = withTiming(-10, { duration: 150 });
    carousel1Opacity.value = withTiming(0, { duration: 150 });
    carousel1TranslateY.value = withTiming(-10, { duration: 150 });
    sectionTitleOpacity.value = withTiming(0, { duration: 150 });
    sectionTitleTranslateY.value = withTiming(-10, { duration: 150 });
    carousel2Opacity.value = withTiming(0, { duration: 150 });
    carousel2TranslateY.value = withTiming(-10, { duration: 150 });
    bannersOpacity.value = withTiming(0, { duration: 150 });
    bannersTranslateY.value = withTiming(-10, { duration: 150 }, (finished) => {
      if (finished) runOnJS(startHeroExit)();
    });
  };

  const handleGoBack = () => {
    setIsTransitioning(true);
    overlayOpacity.value = withTiming(1, { duration: 100 }, (finished) => {
      if (!finished) return;
      galleryOpacity.value = withTiming(0, { duration: 100 }, (finished2) => {
        if (!finished2) return;
        runOnJS(startContentExit)();
      });
    });
  };

  const { data: RecommendationProduct, isLoading: isRecommendationPending } =
    useUserRecommendationList({ tab_id: "" });

  const flatRecommendationProduct = useMemo(
    () =>
      RecommendationProduct?.pages.flatMap((page) =>
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
    [RecommendationProduct],
  );

  const handleFavouriteToggle = () => {
    if (product?.is_favourite) {
      removeFromFav(`${id}`);
    } else {
      saveToFav({ variationid: `${id}` });
      requestAnimationFrame(() => {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      });
    }
  };

  const displayTitle = product?.title ?? paramTitle ?? "";
  const currentImage = product?.images[activeIndex] ?? (imageUri as string);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View collapsable={false} style={backgroundStyle}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />

        <Animated.View
          style={[
            { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 },
            headerStyle,
          ]}
        >
          <View className="flex-row justify-between items-center px-4 py-3">
            <Animated.View style={iconBtnStyle}>
              <TouchableOpacity onPress={handleGoBack} className="p-2">
                <ChevronLeft color="black" size={20} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.Text
              style={titleStyle}
              className="text-lg font-bold text-gray-900 flex-1 text-center mx-4"
              numberOfLines={1}
            >
              {displayTitle}
            </Animated.Text>

            <View className="flex-row gap-4 items-center">
              <Animated.View style={[iconBtnStyle, { padding: 8 }]}>
                <Share2 color="#1f2937" size={20} />
              </Animated.View>
              <Animated.View style={iconBtnStyle}>
                <TouchableOpacity
                  onPress={handleFavouriteToggle}
                  disabled={!product || isSaving || isRemoving}
                  className={`p-2 ${!product || isSaving || isRemoving ? "opacity-50" : ""}`}
                >
                  <Heart
                    color="red"
                    fill={product?.is_favourite ? "red" : "transparent"}
                    size={20}
                  />
                  {product?.is_favourite && (
                    <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center pointer-events-none">
                      <LottieView
                        ref={lottieRef}
                        source={HeartAnimation}
                        loop={false}
                        style={{ width: 60, height: 60 }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
        >
          <View style={{ width, aspectRatio: 1 }}>
            {imageUri && (
              <Animated.View
                style={animatedImageStyle}
                pointerEvents={isTransitioning ? "auto" : "none"}
              >
                <Animated.Image
                  source={{ uri: currentImage as string }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </Animated.View>
            )}

            {product?.images ? (
              <Animated.View
                style={[
                  { width, height: "100%", position: "absolute" },
                  galleryStyle,
                ]}
                pointerEvents={galleryOpacity.value === 0 ? "none" : "auto"}
              >
                <FlatList
                  ref={flatListRef}
                  data={product.images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(event: any) => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x / width,
                    );
                    setActiveIndex(index);
                  }}
                  scrollEventThrottle={16}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        setViewerIndex(activeIndex);
                        setViewerVisible(true);
                      }}
                      style={{ width, aspectRatio: 1 }}
                    >
                      <Image
                        source={{ uri: item }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                />
                <View className="flex-row justify-center absolute bottom-4 w-full gap-2">
                  {product.images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        flatListRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                        setActiveIndex(index);
                      }}
                      className={`h-2 rounded-full ${activeIndex === index ? "w-8 bg-primary" : "w-2 bg-gray-300"}`}
                    />
                  ))}
                </View>
              </Animated.View>
            ) : (
              imageUri && (
                <FallbackGallery
                  imageUri={imageUri as string}
                  galleryStyle={galleryStyle}
                />
              )
            )}
          </View>

          <View className="px-4 pt-4">
            <Animated.View style={titleAnimStyle}>
              <Animated.Text
                style={contentTitleStyle}
                className="text-xl font-bold text-gray-900 leading-7"
              >
                {displayTitle}
              </Animated.Text>
            </Animated.View>

            <Animated.View style={descAnimStyle}>
              {isLoading || !product ? (
                <DescriptionSkeleton />
              ) : (
                <Text className="text-gray-500 leading-5 text-sm mt-2">
                  {product.description}
                </Text>
              )}
            </Animated.View>

            <Animated.View style={variantsAnimStyle}>
              {isLoading || !product ? (
                <VariantsSkeleton />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="py-4"
                >
                  {product.variations.map((item, index) => {
                    const varId = item?.variationid;
                    const isSelected = varId === selectedVariant;
                    return (
                      <TouchableOpacity
                        onPress={() => setSelectedVariant(varId)}
                        key={index}
                        activeOpacity={0.7}
                        className={`w-36 px-4 py-2.5 mr-3 rounded-xl border ${isSelected ? "bg-primary-tint border-primary" : "bg-white border-slate-200"}`}
                      >
                        <Text className="text-gray-500 text-sm font-medium mb-1">
                          {item?.name}
                        </Text>
                        <View className="flex-row items-baseline">
                          <Text className="text-sm font-inter-bold text-slate-900">
                            {item?.price}
                          </Text>
                          {!isSelected && (
                            <Text className="ml-2 text-gray-400 line-through text-xxs">
                              Rs 200
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </Animated.View>

            <Animated.View style={carousel1AnimStyle}>
              {isProductsPending ? (
                <CarouselSkeleton showHeader />
              ) : (
                <ProductCarousel
                  title="Just In"
                  subtitle="Be the first to try them"
                  showHeader
                  moreOption={
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="border border-slate-200 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-slate-600 text-xs font-inter-semibold">
                        View All
                      </Text>
                    </TouchableOpacity>
                  }
                  data={flatProductList || []}
                  isLoading={isProductsPending}
                  isFetchingMore={isFetchingNextPage}
                  onEndReached={handleLoadMore}
                  gap={10}
                  onAddToCart={(id) => addToCart(id, 1)}
                  onRemoveAddToCart={(id) => addToCart(id, -1)}
                />
              )}
            </Animated.View>

            {/* Section title */}
            <Animated.View style={sectionTitleAnimStyle}>
              {isLoading || !product ? (
                <Skeleton
                  style={{
                    width: 180,
                    height: 18,
                    borderRadius: 4,
                    alignSelf: "center",
                    marginVertical: 12,
                  }}
                  variant="shimmer"
                />
              ) : (
                <View className="flex-row items-center justify-center my-3">
                  <Text className="text-base font-bold">
                    ♥️ Just For You ♥️
                  </Text>
                </View>
              )}
            </Animated.View>

            <Animated.View style={carousel2AnimStyle}>
              {isLoading || !product ? (
                <CarouselSkeleton showHeader={false} />
              ) : (
                <ProductCarousel
                  showHeader={false}
                  data={flatRecommendationProduct}
                  isLoading={isRecommendationPending}
                  gap={5}
                  onAddToCart={(id) => addToCart(id, 1)}
                  onRemoveAddToCart={(id) => addToCart(id, -1)}
                />
              )}
            </Animated.View>

            <Animated.View style={bannersAnimStyle}>
              {isLoading || !product ? (
                <>
                  <BannerSkeleton />
                  <BannerSkeleton />
                </>
              ) : (
                <>
                  <View className="h-28 my-4">
                    <Image
                      source={{
                        uri: "https://www.shutterstock.com/image-vector/super-sale-promotional-banner-promo-600nw-2570295095.jpg",
                      }}
                      className="h-full w-full rounded-xl"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="h-28 my-4">
                    <Image
                      source={{
                        uri: "https://www.shutterstock.com/image-vector/super-sale-promotional-banner-promo-600nw-2570295095.jpg",
                      }}
                      className="h-full w-full rounded-xl"
                      resizeMode="cover"
                    />
                  </View>
                </>
              )}
            </Animated.View>
          </View>
        </Animated.ScrollView>

        <SafeAreaView
          edges={["bottom"]}
          className="border-t border-gray-100 bg-white"
        >
          {isLoading || !product ? (
            <ActionBarSkeleton />
          ) : (
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              exiting={FadeOutDown.delay(300).duration(400)}
              className="p-4 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-gray-500 text-xs font-semibold uppercase">
                  {selectedVariationData?.name || product?.title || "Default"}
                </Text>
                <Text className="text-lg font-inter-bold text-slate-900">
                  {formatPrice(selectedVariationData?.price || product?.price)}
                </Text>
                <Text className="text-xs font-medium text-gray-500">
                  Inclusive of all taxes
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  addToCart(selectedVariant, 1);
                  router?.navigate("/(app)/cartlist");
                }}
                activeOpacity={0.8}
                className="bg-primary px-6 py-3.5 rounded-xl shadow-sm"
              >
                <Text className="text-white font-inter-bold text-sm">
                  Add To Cart
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </SafeAreaView>

        {product && (
          <ImageViewerModal
            visible={viewerVisible}
            images={product.images}
            index={viewerIndex}
            onClose={() => setViewerVisible(false)}
          />
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
};

export default ProductDetails;
