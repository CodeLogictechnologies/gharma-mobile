import { Skeleton } from "heroui-native";
import React from "react";
import { View } from "react-native";

const CategorySkeleton = () => (
  <View className="w-[22%] items-center mb-5">
    <View className="aspect-square w-full bg-[#f4f4f4] rounded-md p-2 mb-2 flex items-center justify-center">
      <Skeleton className="w-full h-full rounded-md" />
    </View>
    <Skeleton className="h-3.5 w-16 rounded-md mt-1" />
  </View>
);

export default CategorySkeleton;
