import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const MenuItem = ({ icon: Icon, title, onPress, isLast = false }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center justify-between py-4 ${!isLast ? "border-b border-gray-100" : ""}`}
  >
    <View className="flex-row items-center gap-3">
      <Icon color="#666" size={20} strokeWidth={1.5} />
      <Text className="text-gray-700 font-medium">{title}</Text>
    </View>
    <ChevronRight color="#ccc" size={18} />
  </TouchableOpacity>
);
export default MenuItem;
