// Login/component/RoleSelectionSheet.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RoleData } from "../types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

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
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback?.();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          closeSheet(onClose);
        } else {
          openSheet();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible]);

  const handleSelect = (role: RoleData) => {
    closeSheet(() => onSelect(role));
  };

  const handleClose = () => {
    closeSheet(onClose);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View
          className="absolute inset-0 bg-black/40"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable className="flex-1" onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          className="bg-white rounded-t-3xl shadow-lg"
          style={[{ height: SHEET_HEIGHT }, { transform: [{ translateY }] }]}
        >
          {/* Drag Handle */}
          <View
            {...panResponder.panHandlers}
            className="items-center pt-3 pb-1"
          >
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          <View className="flex-1 px-6 pb-6 pt-2">
            <Text className="text-xl font-bold text-center text-gray-900 mb-1">
              Select Role
            </Text>
            <Text className="text-sm text-center text-gray-500 mb-5">
              Choose your dashboard
            </Text>

            {roles.map((role) => (
              <TouchableOpacity
                key={role?.roleid}
                activeOpacity={0.7}
                onPress={() => handleSelect(role)}
                className="py-4 px-5 mb-3 bg-gray-50 rounded-2xl border border-gray-200"
              >
                <Text className="text-base font-semibold text-center text-gray-900">
                  {role.rolename}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
