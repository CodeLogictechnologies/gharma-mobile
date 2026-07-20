import React, { memo } from "react";
import { ColorValue, StyleSheet, Text, View } from "react-native";

const FILL_COLOR = "#F7ECD1";

const TabIcon = ({
  icon,
  label,
  color,
  focused,
}: {
  icon: React.ReactNode;
  label: string;
  color: ColorValue;
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

const styles = StyleSheet.create({
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
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default memo(TabIcon);
