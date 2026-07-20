import DeliveryBadge from "@/features/address/components/DeliveryBadge";
import { LABEL_COLORS, LABEL_ICONS } from "@/features/address/const";
import {
  useCustomerAddress,
  useDeleteUserAddress,
  useGetShopAddress,
} from "@/features/address/hooks";
import { AddressItem, useAddressStore } from "@/features/address/store";
import { isInsideDeliveryZone } from "@/hooks/useDeliveryZone";
import { useAuthStore } from "@/store/useAuth";
import { router } from "expo-router";
import { Button, Dialog } from "heroui-native";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  MapPin,
  Plus,
  Star,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyAddress() {
  const [deleteTarget, setDeleteTarget] = useState<AddressItem | null>(null);

  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

  const {
    data: apiRes,
    isLoading: apiLoading,
    isError: apiError,
  } = useCustomerAddress();

  const {
    addresses: localAddresses,
    selectedAddressId,
    selectedApiAddressId,
    selectAddress,
    selectApiAddress,
    removeAddress,
    setDefaultAddress,
    hasAddress,
  } = useAddressStore();

  const addresses: AddressItem[] = useMemo(() => {
    if (isLoggedIn && apiRes?.address) {
      return apiRes?.address.map((item: any) => ({
        id: String(item.id ?? item._id ?? Math.random().toString(36).slice(2)),
        label: item.title ?? item.label ?? "Other",
        address: item.address_name ?? item.address ?? "",
        houseNo: item.house_no ?? item.houseNo ?? "",
        landmark: item.landmark ?? "",
        latitude: Number(item.latitude ?? item.lat ?? 0),
        longitude: Number(item.longitude ?? item.lng ?? 0),
        receiverName: item.receiver_name ?? item.receiverName ?? "",
        receiverPhone: item.receiver_phone ?? item.receiverPhone ?? "",
        isDefault: Boolean(item.is_default ?? item.isDefault),
        createdAt: Date.now(),
      }));
    }
    return localAddresses;
  }, [isLoggedIn, apiRes, localAddresses]);

  const { data: shopData, isLoading: zonesLoading } = useGetShopAddress();

  const { mutate: deleteApiAddress, isPending: isDeleting } =
    useDeleteUserAddress();

  const deliveryZones = useMemo(
    () =>
      (shopData?.data ?? [])
        .filter(
          (s) =>
            s.coordinates?.latitude != null && s.coordinates?.longitude != null,
        )
        .map((s) => ({
          latitude: s.coordinates.latitude!,
          longitude: s.coordinates.longitude!,
          radius: 5000,
        })),
    [shopData],
  );

  const deliveryMap = useMemo(() => {
    if (deliveryZones.length === 0) return {} as Record<string, boolean>;
    return Object.fromEntries(
      addresses.map((addr) => [
        addr.id,
        isInsideDeliveryZone(addr.latitude, addr.longitude, deliveryZones),
      ]),
    );
  }, [addresses, deliveryZones]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    if (isLoggedIn) {
      deleteApiAddress(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    } else {
      removeAddress(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, isLoggedIn, deleteApiAddress, removeAddress]);

  const handleSelect = useCallback(
    (id: string) => {
      if (isLoggedIn) {
        selectApiAddress(id);
        selectAddress(id);
      }
      router.back();
    },
    [isLoggedIn, selectApiAddress, selectAddress],
  );
  const isLoadingAddresses = isLoggedIn && apiLoading;
  const showEmpty = !isLoadingAddresses && addresses.length === 0;
  const showList = !isLoadingAddresses && addresses.length > 0;

  return (
    <>
      <View className="flex-1 bg-white">
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronLeft size={22} color="black" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text className="text-lg font-inter-bold text-gray-900">
                My Addresses
              </Text>
            </View>
            <Text className="text-sm text-gray-400">
              {addresses.length} saved
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading */}
          {isLoadingAddresses && (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#D7A11B" />
              <Text className="text-sm text-gray-400 mt-4">
                Loading your addresses…
              </Text>
            </View>
          )}

          {/* Error */}
          {apiError && isLoggedIn && (
            <View className="items-center justify-center py-16 px-6">
              <AlertCircle size={32} color="#EF4444" />
              <Text className="text-base font-medium text-gray-900 mt-4 mb-1">
                Couldn’t load addresses
              </Text>
              <Text className="text-sm text-gray-400 text-center">
                Something went wrong while fetching your saved addresses.
              </Text>
            </View>
          )}

          {/* Empty */}
          {showEmpty && (
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 bg-primary-tint rounded-full items-center justify-center mb-4">
                <MapPin size={32} color="#D7A11B" />
              </View>
              <Text className="text-base font-medium text-gray-900 mb-1">
                No addresses saved
              </Text>
              <Text className="text-sm text-gray-400 text-center mb-6">
                Add your delivery address to start ordering
              </Text>
            </View>
          )}

          {showList &&
            addresses.map((addr) => {
              const isSelected = isLoggedIn
                ? selectedApiAddressId === addr.id
                : selectedAddressId === addr.id;
              const Icon = LABEL_ICONS[addr.label] ?? LABEL_ICONS.Other;
              const labelColor = LABEL_COLORS[addr.label] ?? LABEL_COLORS.Other;
              const available = deliveryMap[addr.id] ?? false;

              return (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => handleSelect(addr.id)}
                  activeOpacity={0.8}
                  className={`mb-3 rounded-xl border p-4 ${
                    isSelected
                      ? "border-primary bg-primary-tint/60"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className={`w-10 h-10 rounded-xl items-center justify-center mt-0.5 ${
                        available ? "bg-green-50" : "bg-gray-50"
                      }`}
                    >
                      {Icon}
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${labelColor}`}
                        >
                          {addr.label}
                        </Text>
                        {addr.isDefault && (
                          <View className="flex-row items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                            <Star size={10} color="#D7A11B" fill="#D7A11B" />
                            <Text className="text-[10px] text-gray-500 font-medium">
                              Default
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text className="text-sm text-gray-900 leading-5 mb-1">
                        {addr.address}
                      </Text>

                      <DeliveryBadge
                        available={available}
                        loading={zonesLoading}
                      />

                      {isSelected && (
                        <View className="flex-row items-center gap-1 mt-2">
                          <View className="w-4 h-4 rounded-full bg-primary items-center justify-center">
                            <Check size={10} color="white" strokeWidth={3} />
                          </View>
                          <Text className="text-xs font-inter-semibold text-primary-dark">
                            Delivering here
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center gap-1">
                      {!addr.isDefault && (
                        <TouchableOpacity
                          onPress={() => setDefaultAddress(addr.id)}
                          className="p-2"
                          hitSlop={{
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                          }}
                        >
                          <Star size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => setDeleteTarget(addr)}
                        className="p-2"
                        hitSlop={{
                          top: 10,
                          bottom: 10,
                          left: 10,
                          right: 10,
                        }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {isSelected && !available && !zonesLoading && (
                    <View className="mt-3 flex-row items-center gap-2 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
                      <AlertCircle size={14} color="#EF4444" />
                      <Text className="text-xs text-red-600 flex-1">
                        Delivery is currently unavailable at this address. You
                        may still place orders for pickup.
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-primary py-3.5 rounded-xl shadow-sm"
            activeOpacity={0.8}
            onPress={() => router.push("/address")}
          >
            <Plus size={20} color="white" />
            <Text className="text-white text-base font-inter-bold">
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Dialog
        isOpen={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>
              <Text className="text-lg font-bold text-gray-900">
                Remove Address?
              </Text>
            </Dialog.Title>
            <Dialog.Description>
              <Text className="text-sm text-gray-500">
                Are you sure you want to remove "{deleteTarget?.label}" address?
              </Text>
            </Dialog.Description>
            <View className="flex-row justify-end gap-3">
              <Button onPress={() => setDeleteTarget(null)} className="mr-2">
                <Text className="text-gray-600">Cancel</Text>
              </Button>
              <Button onPress={handleDelete} isDisabled={isDeleting}>
                <Text className="text-white">Remove</Text>
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
