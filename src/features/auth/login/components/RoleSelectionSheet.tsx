import BottomSheet, { BottomSheetView } from "@expo/ui/community/bottom-sheet";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { RoleData } from "../types";

interface Props {
  roles: RoleData[];
  visible: boolean;
  onSelect: (role: RoleData) => void;
  onClose: () => void;
}

export const RoleSelectionSheet = ({
  roles,
  visible,
  onSelect,
  onClose,
}: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setSelectedRoleId(null);
        onClose();
      }
    },
    [onClose],
  );

  const handleSelect = useCallback(
    (role: RoleData) => {
      setSelectedRoleId(role.roleid);
      bottomSheetRef.current?.close();

      setTimeout(() => {
        onSelect(role);
      }, 300);
    },
    [onSelect],
  );

  useEffect(() => {
    if (visible) {
      setSelectedRoleId(null);
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const isLoading = selectedRoleId !== null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enablePanDownToClose
      enableDynamicSizing
      onChange={handleSheetChange}
      handleComponent={() => (
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-gray-300" />
        </View>
      )}
      backgroundStyle={{
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 24,
          // removed flex: 1
        }}
      >
        <Text className="text-xl font-bold text-center text-gray-900 mb-1">
          Select Role
        </Text>
        <Text className="text-sm text-center text-gray-500 mb-5">
          Choose your dashboard
        </Text>

        {roles?.map((role) => {
          const isSelected = selectedRoleId === role.roleid;

          return (
            <TouchableOpacity
              key={role.roleid}
              activeOpacity={0.7}
              onPress={() => handleSelect(role)}
              disabled={isLoading}
              className={`py-4 px-5 mb-3 rounded-2xl border flex-row items-center justify-center ${
                isSelected
                  ? "bg-primary/10 border-primary"
                  : "bg-gray-50 border-gray-200"
              } ${isLoading && !isSelected ? "opacity-50" : ""}`}
            >
              {isSelected && (
                <ActivityIndicator
                  size="small"
                  color="#d7a11b"
                  className="mr-2"
                />
              )}
              <Text
                className={`text-base font-semibold text-center ${
                  isSelected ? "text-primary" : "text-gray-900"
                }`}
              >
                {role.rolename || "Unknown Role"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BottomSheetView>
    </BottomSheet>
  );
};
