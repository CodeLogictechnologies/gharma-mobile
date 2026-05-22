import Container from "@/components/common/Container";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 32;

const banners = [
  {
    id: "1",
    image:
      "https://www.shutterstock.com/image-vector/super-sale-promotional-banner-promo-600nw-2570295095.jpg",
  },
  {
    id: "2",
    image:
      "https://i.pinimg.com/736x/c2/40/b5/c240b5d24e6161f2a4a3619da5307f7b.jpg",
  },
  {
    id: "3",
    image:
      "https://static.vecteezy.com/system/resources/previews/053/448/156/non_2x/big-sale-banner-design-with-red-background-for-shopping-day-promotion-online-shopping-special-offer-coupons-vouchers-banner-templates-websites-social-media-advertising-vector.jpg",
  },
];

const HomePageBanner = () => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  //  if (false) {
  //   return (
  //     <Container className="relative">
  //       <BannerSkeleton />
  //     </Container>
  //   );
  // }

  return (
    <Container className="relative pt-4">
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
          setActiveIndex(index);
        }}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={{ width: ITEM_WIDTH }} className="h-48 px-1">
            <Image
              source={{ uri: item.image }}
              className="h-full w-full rounded-md"
              resizeMode="cover"
            />
          </View>
        )}
      />

      <View className="absolute bottom-4 w-full flex-row justify-center items-center gap-2">
        {banners.map((_, index) => (
          <PaginationDot key={index} index={index} activeIndex={activeIndex} />
        ))}
      </View>
    </Container>
  );
};

export default HomePageBanner;

const PaginationDot = ({
  index,
  activeIndex,
}: {
  index: number;
  activeIndex: number;
}) => {
  const isActive = useDerivedValue(() =>
    withTiming(activeIndex === index ? 1 : 0),
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(isActive.value, [0, 1], [10, 28]),
      backgroundColor: interpolateColor(
        isActive.value,
        [0, 1],
        ["#E5E7EB", "#3B82F6"],
      ),
    };
  });

  return (
    <Animated.View style={[{ height: 8, borderRadius: 4 }, animatedStyle]} />
  );
};
