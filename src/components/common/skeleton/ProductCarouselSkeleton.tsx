import { Skeleton } from "heroui-native";
import React from "react";
import { View } from "react-native";

const SkeletonProductCard = ({ width = 128 }: { width?: number }) => {
  return (
    <View style={{ width }}>
      <Skeleton
        className="rounded-md"
        style={{ width, height: width, borderRadius: 6 }}
        variant="shimmer"
        animation={{
          shimmer: {
            duration: 2000,
            speed: 1.5,
            highlightColor: "rgba(0,0,0,0.05)",
          },
        }}
      />

      <View style={{ marginTop: 12 }}>
        <Skeleton className="h-3 rounded-md" style={{ width: 80 }} />
      </View>

      <View style={{ marginTop: 6 }}>
        <Skeleton className="h-2.5 rounded-md" style={{ width: "100%" }} />
      </View>
      <View style={{ marginTop: 4 }}>
        <Skeleton className="h-2.5 rounded-md" style={{ width: "70%" }} />
      </View>
    </View>
  );
};

export default SkeletonProductCard;
