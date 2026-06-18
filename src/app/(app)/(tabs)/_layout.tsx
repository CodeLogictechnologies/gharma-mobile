// import { Tabs } from "expo-router";
// import { BookHeart, Handbag, House, LayoutGrid } from "lucide-react-native";
// import React, { useEffect } from "react";
// import { View } from "react-native";
// import Animated, {
//   Easing,
//   interpolate,
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
// } from "react-native-reanimated";

// const TAB_HEIGHT = 60;
// const ACTIVE_COLOR = "#D7A11B";
// const INACTIVE_COLOR = "#737373";
// const FILL_COLOR = "#E8DAB5";

// const PILL_HEIGHT = 40;
// const PILL_WIDTH = 34;

// const AnimatedTabIcon = ({
//   focused,
//   icon,
// }: {
//   focused: boolean;
//   icon: React.ReactNode;
// }) => {
//   const progress = useSharedValue(focused ? 1 : 0);

//   useEffect(() => {
//     progress.value = withTiming(focused ? 1 : 0, {
//       duration: 450,
//       easing: Easing.inOut(Easing.ease),
//     });
//   }, [focused, progress]);

//   const fillStyle = useAnimatedStyle(() => ({
//     height: interpolate(progress.value, [0, 1], [0, PILL_HEIGHT]),
//   }));

//   return (
//     <View
//       style={{
//         width: PILL_WIDTH,
//         height: PILL_HEIGHT,
//         paddingTop: 10,
//         alignItems: "center",
//         justifyContent: "flex-start",
//       }}
//     >
//       <View
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           height: PILL_HEIGHT,
//           overflow: "hidden",
//           justifyContent: "flex-start",
//         }}
//       >
//         <Animated.View
//           style={[
//             {
//               backgroundColor: FILL_COLOR,
//               borderBottomEndRadius: 10,
//               borderBottomStartRadius: 10,
//               width: "100%",
//             },
//             fillStyle,
//           ]}
//         />
//       </View>

//       <View style={{ zIndex: 1 }}>{icon}</View>
//     </View>
//   );
// };

// const TabLayout = () => {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           height: TAB_HEIGHT,
//         },
//         tabBarActiveTintColor: ACTIVE_COLOR,
//         tabBarInactiveTintColor: INACTIVE_COLOR,
//         tabBarLabelStyle: {
//           fontSize: 12,
//           marginTop: 8,

//           minWidth: 50,
//           textAlign: "center",
//           includeFontPadding: false,
//         },
//         tabBarItemStyle: {
//           paddingHorizontal: 4,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="(home)"
//         options={{
//           title: "Home",
//           tabBarLabel: "Home",
//           headerShown: false,
//           tabBarIcon: ({ focused, color }) => (
//             <AnimatedTabIcon
//               focused={focused}
//               icon={<House size={22} color={color} strokeWidth={2.2} />}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="categories"
//         options={{
//           title: "Categories",
//           tabBarLabel: "Categories",
//           headerShown: false,
//           tabBarIcon: ({ focused, color }) => (
//             <AnimatedTabIcon
//               focused={focused}
//               icon={<LayoutGrid size={22} color={color} />}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="order"
//         options={{
//           title: "Order Again",
//           tabBarLabel: "Order Again",
//           headerShown: false,
//           tabBarIcon: ({ focused, color }) => (
//             <AnimatedTabIcon
//               focused={focused}
//               icon={<Handbag size={22} color={color} />}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="favourite"
//         options={{
//           title: "Favourite",
//           tabBarLabel: "Favourite", // ← explicit label
//           headerShown: false,
//           tabBarIcon: ({ focused, color }) => (
//             <AnimatedTabIcon
//               focused={focused}
//               icon={<BookHeart size={22} color={color} />}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// };

// export default TabLayout;
import { Tabs } from "expo-router";
import { Handbag, House, LayoutGrid, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TAB_HEIGHT = 50;
const ACTIVE_COLOR = "#D7A11B";
const INACTIVE_COLOR = "#737373";
const FILL_COLOR = "#E8DAB5";

const TabIcon = ({
  icon,
  label,
  color,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  focused: boolean;
}) => {
  return (
    <View style={styles.tabButton}>
      {focused && <View style={styles.pill} />}
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Home"
              icon={<House size={20} color={color} strokeWidth={2.2} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Categories"
              icon={<LayoutGrid size={20} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Order Again"
              icon={<Handbag size={20} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Profile"
              icon={<User size={20} color={color} />}
            />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: TAB_HEIGHT,
    paddingTop: 6,
    paddingBottom: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    width: 70,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    position: "relative",
  },
  pill: {
    position: "absolute",
    top: 0,
    width: 34,
    height: 36,
    backgroundColor: FILL_COLOR,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  iconWrapper: {
    zIndex: 1,
    marginTop: 8,
  },
  label: {
    zIndex: 1,
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default TabLayout;
