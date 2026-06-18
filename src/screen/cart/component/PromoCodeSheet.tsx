import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { X, Tag, Percent, Clock, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCouponCodeList } from "../hooks";
import { Coupon } from "../types";

interface PromoCodeSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (coupon: Coupon) => void;
  appliedCouponId?: string | null;
}

export const PromoCodeSheet = ({
  visible,
  onClose,
  onApply,
  appliedCouponId,
}: PromoCodeSheetProps) => {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError } = useCouponCodeList();
  const [searchQuery, setSearchQuery] = React.useState("");

  const coupons = data?.data ?? [];

  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons;
    return coupons.filter((c) =>
      c.coupon_code.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [coupons, searchQuery]);

  const handleApply = useCallback(
    (coupon: Coupon) => {
      onApply(coupon);
      onClose();
    },
    [onApply, onClose],
  );

  const getDiscountLabel = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage" && coupon.percentage) {
      return `${coupon.percentage}% OFF`;
    }
    if (coupon.discount_type === "fixed" && coupon.value) {
      return `Rs. ${coupon.value} OFF`;
    }
    return "Discount";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-end"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-2xl overflow-hidden"
          style={{ maxHeight: "85%", paddingBottom: insets.bottom }}
        >
          {/* Header */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Apply Promo Code
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="w-8 h-8 items-center justify-center bg-gray-100 rounded-full"
              >
                <X size={18} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5">
              <Tag size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Enter promo code"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-sm text-gray-900"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator color="#16A34A" size="large" />
              <Text className="text-sm text-gray-500 mt-3">
                Loading offers...
              </Text>
            </View>
          ) : isError ? (
            <View className="py-12 items-center justify-center px-6">
              <Text className="text-sm text-gray-500 text-center">
                Failed to load coupons. Please try again.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="mt-4 bg-primary px-6 py-2 rounded-lg"
              >
                <Text className="text-white text-sm font-semibold">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredCoupons.length === 0 ? (
            <View className="py-12 items-center justify-center px-6">
              <Tag size={40} color="#D1D5DB" />
              <Text className="text-sm text-gray-500 mt-3 text-center">
                {searchQuery
                  ? `No coupon found for "${searchQuery}"`
                  : "No coupons available right now"}
              </Text>
            </View>
          ) : (
            <ScrollView
              className="px-4"
              contentContainerStyle={{ paddingVertical: 12, gap: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Available Offers ({filteredCoupons.length})
              </Text>

              {filteredCoupons.map((coupon) => {
                const isApplied = appliedCouponId === coupon.id;
                return (
                  <View
                    key={coupon.id}
                    className={`border rounded-xl p-4 ${
                      isApplied
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <View
                            className={`px-2.5 py-1 rounded-md ${
                              isApplied ? "bg-green-600" : "bg-green-100"
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isApplied ? "text-white" : "text-green-700"
                              }`}
                            >
                              {coupon.coupon_code}
                            </Text>
                          </View>
                          {isApplied && (
                            <View className="flex-row items-center gap-1">
                              <Check size={14} color="#16A34A" />
                              <Text className="text-xs font-semibold text-green-600">
                                Applied
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-sm font-bold text-gray-900 mt-2">
                          {getDiscountLabel(coupon)}
                        </Text>

                        <View className="flex-row items-center gap-1.5 mt-1.5">
                          <Clock size={12} color="#9CA3AF" />
                          <Text className="text-xs text-gray-400">
                            Valid till expiry
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleApply(coupon)}
                        disabled={isApplied}
                        className={`px-4 py-2 rounded-lg ${
                          isApplied
                            ? "bg-gray-200"
                            : "bg-green-600"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            isApplied ? "text-gray-500" : "text-white"
                          }`}
                        >
                          {isApplied ? "Applied" : "Apply"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};