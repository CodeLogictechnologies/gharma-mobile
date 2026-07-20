import { Skeleton } from "heroui-native";
import React from "react";
import { View } from "react-native";

export const SubCategorySkeleton = () => (
  <View className="items-center py-4 px-1 border-b border-gray-50">
    <Skeleton className="w-12 h-12 rounded-lg mb-1" />
    <Skeleton className="h-3 w-10 rounded mt-1" />
  </View>
);
