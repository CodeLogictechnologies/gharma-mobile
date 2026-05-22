import React, { useRef } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity } from "react-native";
import Animated, {
  LinearTransition,
  SlideInLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

type Props = {
  categories: any[];
  activeIndex: number;
  onChange: (index: number) => void;
};

const CategoryTabs = ({ categories, activeIndex, onChange }: Props) => {
  const scrollRef = useRef<ScrollView>(null);

  const handlePress = (index: number) => {
    onChange(index);
    const itemWidth = 90; // match your min-w
    const x = index * itemWidth - screenWidth / 2 + itemWidth / 2;
    scrollRef.current?.scrollTo({
      x: Math.max(0, x),
      animated: true,
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {categories?.map((cat, index) => (
        <CategoryTabItem
          key={index}
          cat={cat}
          isActive={activeIndex === index}
          onPress={() => handlePress(index)}
        />
      ))}
    </ScrollView>
  );
};

type ItemProps = {
  cat: any;
  isActive: boolean;
  onPress: () => void;
};

const CategoryTabItem = ({ cat, isActive, onPress }: ItemProps) => {
  const offset = useSharedValue(0);

  const slideWithBounce = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(offset.value) },
      {
        translateY: withSpring(isActive ? 0 : 2, {
          damping: 20,
          stiffness: 100,
        }),
      },
    ],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        onPress();
        offset.value = 1;
      }}
      className="min-w-[80px] items-center justify-center"
    >
      <Animated.View
        entering={SlideInLeft}
        exiting={SlideOutRight}
        layout={LinearTransition.springify()}
        style={slideWithBounce}
        className={`w-full items-center justify-center px-2 py-2 rounded-t-2xl ${
          isActive ? "bg-white" : "bg-[#FFF7ED]"
        }`}
      >
        <cat.Icon size={18} color="black" />

        <Text
          className="text-center text-xs mt-1 font-medium"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {cat.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default CategoryTabs;
