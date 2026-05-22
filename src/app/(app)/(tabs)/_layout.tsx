import { Tabs } from "expo-router";
import { BookHeart, Handbag, House, LayoutGrid } from "lucide-react-native";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const TAB_HEIGHT = 66;
const ACTIVE_COLOR = "#D7A11B";
const INACTIVE_COLOR = "#737373";
const FILL_COLOR = "#E8DAB5";

const PILL_HEIGHT = 40;
const PILL_WIDTH = 34;

const AnimatedTabIcon = ({
  focused,
  icon,
}: {
  focused: boolean;
  icon: React.ReactNode;
}) => {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 450,
      easing: Easing.inOut(Easing.ease),
    });
  }, [focused, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, PILL_HEIGHT]),
  }));

  return (
    <View
      style={{
        width: PILL_WIDTH,
        height: PILL_HEIGHT,
        paddingTop: 10,
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: PILL_HEIGHT,
          overflow: "hidden",
          justifyContent: "flex-start",
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: FILL_COLOR,
              borderBottomEndRadius: 10,
              borderBottomStartRadius: 10,
              width: "100%",
            },
            fillStyle,
          ]}
        />
      </View>

      <View style={{ zIndex: 1 }}>{icon}</View>
    </View>
  );
};

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: TAB_HEIGHT,
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              focused={focused}
              icon={<House size={22} color={color} strokeWidth={2.2} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              focused={focused}
              icon={<LayoutGrid size={22} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Order Again",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              focused={focused}
              icon={<Handbag size={22} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favourite"
        options={{
          title: "Favourite",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              focused={focused}
              icon={<BookHeart size={22} color={color} />}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
