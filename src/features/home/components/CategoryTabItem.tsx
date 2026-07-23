import { DynamicIcon } from "@/components/common/DynamicIcon";
import React, { useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { HomeTabsItem } from "../types";

const screenWidth = Dimensions.get("window").width;

type Props = {
  tabs: HomeTabsItem[];
  isLoading?: boolean;
  activeIndex: number;
  onChange: (index: number, tabId: string) => void;
  colorProgress: SharedValue<number>;
  fromShade: SharedValue<string>;
  toShade: SharedValue<string>;
};

const CategoryTabs = ({
  tabs,
  isLoading,
  activeIndex,
  onChange,
  colorProgress,
  fromShade,
  toShade,
}: Props) => {
  const scrollRef = useRef<ScrollView>(null);

  const handlePress = (index: number, tabId: string) => {
    onChange(index, tabId);
    const itemWidth = 80;
    const x = index * itemWidth - screenWidth / 2 + itemWidth / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, x), animated: true });
  };

  if (isLoading) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            className="min-w-[80px] items-center justify-center px-2 py-2"
          >
            <View className="w-10 h-10 rounded-full bg-black/10 mb-1" />
            <View className="w-14 h-2.5 rounded-full bg-black/10" />
          </View>
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
          colorProgress={colorProgress}
          fromShade={fromShade}
          toShade={toShade}
        />
      ))}
    </ScrollView>
  );
};

const CategoryTabItem = ({
  cat,
  isActive,
  onPress,
  colorProgress,
  fromShade,
  toShade,
}: {
  cat: HomeTabsItem;
  isActive: boolean;
  onPress: () => void;
  colorProgress: SharedValue<number>;
  fromShade: SharedValue<string>;
  toShade: SharedValue<string>;
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

  const tabBgStyle = useAnimatedStyle(() => ({
    backgroundColor: isActive
      ? "#ffffff"
      : interpolateColor(
          colorProgress.value,
          [0, 1],
          [fromShade.value || "#ffffff", toShade.value || "#ffffff"],
        ),
  }));

  const notchBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      [fromShade.value || "#ffffff", toShade.value || "#ffffff"],
    ),
  }));

  const notchOpacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isActive ? 1 : 0, {
      damping: 20,
      stiffness: 150,
    }),
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
        style={[slideWithBounce, tabBgStyle]}
        className="w-full items-center justify-center px-2 py-2 rounded-t-2xl"
      >
        <Animated.View
          style={[
            { position: "absolute", bottom: 0, left: -10 },
            notchOpacityStyle,
          ]}
          pointerEvents="none"
        >
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#fff",
            }}
          >
            <Animated.View
              style={[{ flex: 1, borderBottomRightRadius: 10 }, notchBgStyle]}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            { position: "absolute", bottom: 0, right: -10 },
            notchOpacityStyle,
          ]}
          pointerEvents="none"
        >
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#fff",
            }}
          >
            <Animated.View
              style={[{ flex: 1, borderBottomLeftRadius: 10 }, notchBgStyle]}
            />
          </View>
        </Animated.View>

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
