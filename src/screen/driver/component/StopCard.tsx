import { DeliveryStop } from "@/app/(driver)/drivermap";
import { CheckCircle } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface StopCardProps {
  stop: DeliveryStop;
  isActive: boolean;
  onPress: () => void;
}

export default function StopCard({ stop, isActive, onPress }: StopCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={stop.status === "COMPLETED"}
      className={`mr-3 p-3 rounded-xl border-2 w-44 flex-shrink-0 ${
        stop.status === "COMPLETED"
          ? "border-green-300 bg-green-50"
          : isActive
            ? "border-yellow-400 bg-yellow-50"
            : "border-gray-200 bg-white"
      }`}
    >
      <View className="flex-row items-center gap-1.5 mb-1">
        <Text className="text-xs font-bold text-gray-700">{stop.label}</Text>
        {stop.status === "COMPLETED" && (
          <CheckCircle size={13} color="#16a34a" />
        )}
      </View>
      <Text className="text-xs text-gray-500 leading-4">{stop.address}</Text>
      <View
        className={`mt-2 px-2 py-0.5 rounded-full self-start ${
          stop.status === "COMPLETED"
            ? "bg-green-200"
            : stop.status === "EN_ROUTE"
              ? "bg-amber-100"
              : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-[10px] font-semibold ${
            stop.status === "COMPLETED"
              ? "text-green-700"
              : stop.status === "EN_ROUTE"
                ? "text-amber-700"
                : "text-gray-500"
          }`}
        >
          {stop.status === "COMPLETED"
            ? "Delivered"
            : stop.status === "EN_ROUTE"
              ? "En Route"
              : "Pending"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
