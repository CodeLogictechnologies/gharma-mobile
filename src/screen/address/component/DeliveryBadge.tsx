import { AlertCircle, CheckCircle2 } from "lucide-react-native";
import { ActivityIndicator, Text, View } from "react-native";

export const DeliveryBadge = ({
  available,
  loading,
}: {
  available: boolean;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <View className="flex-row items-center gap-1 mt-1.5">
        <ActivityIndicator size="small" color="#9CA3AF" />
        <Text className="text-[10px] text-gray-400">Checking delivery…</Text>
      </View>
    );
  }
  return (
    <View
      className={`flex-row items-center gap-1 mt-1.5 self-start px-2 py-0.5 rounded-md ${
        available ? "bg-green-50" : "bg-red-50"
      }`}
    >
      {available ? (
        <CheckCircle2 size={11} color="#16A34A" />
      ) : (
        <AlertCircle size={11} color="#EF4444" />
      )}
      <Text
        className={`text-[10px] font-semibold ${available ? "text-green-700" : "text-red-600"}`}
      >
        {available ? "Delivery available" : "No delivery here"}
      </Text>
    </View>
  );
};

export default DeliveryBadge;
