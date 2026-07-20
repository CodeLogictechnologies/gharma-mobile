import { Skeleton } from "heroui-native";
import React from "react";
import { Dimensions, View } from "react-native";

const ITEM_WIDTH = Dimensions.get("window").width - 32;

const BannerSkeleton = () => {
  return (
    <View className="relative pt-4">
      <Skeleton
        style={{ width: ITEM_WIDTH, height: 192 }}
        className="rounded-md"
        variant="shimmer"
        animation={{
          shimmer: {
            duration: 2000,
            speed: 1.5,
            highlightColor: "rgba(0,0,0,0.05)",
          },
        }}
      />

      <View className="absolute bottom-4 w-full flex-row justify-center items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            style={{ width: i === 0 ? 28 : 10, height: 8, borderRadius: 4 }}
            variant="shimmer"
            animation={{
              shimmer: {
                duration: 2000,
                speed: 1.5,
                highlightColor: "rgba(0,0,0,0.05)",
              },
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerSkeleton;
