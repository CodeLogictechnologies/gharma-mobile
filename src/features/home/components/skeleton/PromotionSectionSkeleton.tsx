import React from "react";
import { View } from "react-native";

export function PromotionSectionSkeleton() {
  return (
    <View className="my-5 mx-2 rounded-2xl overflow-hidden bg-slate-100">
      <View className="px-4 pt-4 pb-3">
        <View className="w-32 h-4 rounded bg-slate-200 mb-2" />
        <View className="w-20 h-2.5 rounded bg-slate-200" />
      </View>
      <View className="flex-row px-3 pb-4 gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} className="w-32 h-40 rounded-xl bg-slate-200" />
        ))}
      </View>
    </View>
  );
}
