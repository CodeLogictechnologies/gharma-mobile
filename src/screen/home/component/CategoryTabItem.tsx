import * as icons from "lucide-react-native/icons";
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
import { HomeTabsItem } from "../types";

const screenWidth = Dimensions.get("window").width;

// ─── Dynamic Icon ─────────────────────────────────────────────────────────────
const DynamicIcon = ({
  name,
  color = "black",
  size = 20,
  strokeWidth = 2,
}: {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const LucideIcon = icons[name as keyof typeof icons] as
    | React.ComponentType<{
        color?: string;
        size?: number;
        strokeWidth?: number;
      }>
    | undefined;

  if (!LucideIcon) return null;
  return <LucideIcon color={color} size={size} strokeWidth={strokeWidth} />;
};

// ─── CategoryTabs ─────────────────────────────────────────────────────────────
type Props = {
  tabs: HomeTabsItem[];
  isLoading?: boolean;
  activeIndex: number;
  onChange: (index: number, tabId: string) => void;
};

const CategoryTabs = ({ tabs, isLoading, activeIndex, onChange }: Props) => {
  const scrollRef = useRef<ScrollView>(null);

  const handlePress = (index: number, tabId: string) => {
    onChange(index, tabId);
    const itemWidth = 90;
    const x = index * itemWidth - screenWidth / 2 + itemWidth / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, x), animated: true });
  };

  if (isLoading) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Animated.View
            key={i}
            entering={SlideInLeft.delay(i * 60)}
            className="min-w-[80px] items-center justify-center px-2 py-2 mx-0.5"
          >
            <Animated.View className="w-10 h-10 rounded-full bg-orange-100 mb-1" />
            <Animated.View className="w-14 h-2.5 rounded-full bg-orange-100" />
          </Animated.View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {tabs.map((cat, index) => (
        <CategoryTabItem
          key={cat.id}
          cat={cat}
          isActive={activeIndex === index}
          onPress={() => handlePress(index, cat.id)}
        />
      ))}
    </ScrollView>
  );
};

// ─── CategoryTabItem ──────────────────────────────────────────────────────────
const CategoryTabItem = ({
  cat,
  isActive,
  onPress,
}: {
  cat: HomeTabsItem;
  isActive: boolean;
  onPress: () => void;
}) => {
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
        <DynamicIcon
          name={cat.icon_name}
          size={20}
          color={isActive ? "#000" : "#6b7280"}
          strokeWidth={isActive ? 2.5 : 1.8}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className={`text-center text-xs mt-1 font-medium ${
            isActive ? "text-black" : "text-gray-500"
          }`}
        >
          {cat.tab_name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default CategoryTabs;
