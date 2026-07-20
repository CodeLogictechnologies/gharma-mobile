import { Skeleton } from "heroui-native";
import React from "react";
import { View } from "react-native";

const OrderCardSkeleton = () => (
  <View className="bg-white mt-2 p-4">
    <View className="flex-row justify-between items-center mb-3">
      <View className="flex-row items-center">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-32 ml-2 rounded" />
      </View>
      <Skeleton className="h-4 w-20 rounded" />
    </View>

    <Skeleton className="h-8 w-full rounded-md mb-3" />

    <View className="flex-row">
      <Skeleton className="w-20 h-20 rounded-md" />
      <View className="flex-1 ml-3">
        <Skeleton className="h-4 w-full rounded mb-1" />
        <Skeleton className="h-3 w-24 rounded mt-2" />
        <Skeleton className="h-4 w-20 rounded mt-2" />
      </View>
      <Skeleton className="h-4 w-10 rounded self-end" />
    </View>

    <View className="items-end mt-4 border-t border-gray-100 pt-3">
      <Skeleton className="h-4 w-40 rounded mb-2" />
      <View className="flex-row mt-3">
        <Skeleton className="h-9 w-28 rounded-md mr-2" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </View>
    </View>
  </View>
);

export default OrderCardSkeleton;
