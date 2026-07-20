import TabIcon from "@/components/navigation/TabIcon";
import { Tabs } from "expo-router";
import { Handbag, House, LayoutGrid, User } from "lucide-react-native";
import React from "react";
import { StyleSheet } from "react-native";

const TAB_HEIGHT = 50;
const ACTIVE_COLOR = "#D7A11B";
const INACTIVE_COLOR = "#737373";

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
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
});

export default TabLayout;
