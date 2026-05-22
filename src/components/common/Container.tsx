import React from "react";
import { View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  className?: string;
};

const Container = ({
  children,
  style,
  noPadding = false,
  className = "",
}: Props) => {
  return (
    <View
      className={`flex-1 ${noPadding ? "" : "px-4"} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
};

export default Container;
