import * as icons from "lucide-react-native/icons";
import React, { useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
            <Animated.View className="w-10 h-10 rounded-full bg-black/10 mb-1" />
            <Animated.View className="w-14 h-2.5 rounded-full bg-black/10" />
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
      style={{ zIndex: isActive ? 2 : 1 }}
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
        {isActive && (
          <>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                bottom: 0,
                left: -12,
                width: 12,
                height: 12,
                backgroundColor: "#fff",
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FFF7ED",
                  borderBottomRightRadius: 12,
                }}
              />
            </View>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                bottom: 0,
                right: -12,
                width: 12,
                height: 12,
                backgroundColor: "#fff",
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FFF7ED",
                  borderBottomLeftRadius: 12,
                }}
              />
            </View>
          </>
        )}
        <DynamicIcon
          name={cat.icon_name}
          size={20}
          color={isActive ? "#b5860f" : "#6b7280"}
          strokeWidth={isActive ? 2.5 : 1.8}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className={`text-center text-xs mt-1 ${
            isActive
              ? "text-slate-900 font-inter-semibold"
              : "text-gray-500 font-medium"
          }`}
        >
          {cat.tab_name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default CategoryTabs;
