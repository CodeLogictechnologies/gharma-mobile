
import { DeliveryStop } from "@/app/(driver)/drivermap";
import { ShieldCheck, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface OtpVerificationModalProps {
  visible: boolean;
  stop: DeliveryStop | null;
  onClose: () => void;
  onVerify: (otp: string) => void;
  isVerifying: boolean;
}

export default function OtpVerificationModal({
  visible,
  stop,
  onClose,
  onVerify,
  isVerifying,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (visible) {
      setOtp(["", "", "", ""]);
      setError("");
    }
  }, [visible]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    setError("");
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const entered = otp.join("");
    if (entered.length < 4) {
      setError("Please enter all 4 digits.");
      shake();
      return;
    }
    onVerify(entered);
  };

  if (!stop) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white px-6 pt-6 pb-10">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={22} color="#1A73E8" />
              <Text className="text-[17px] font-bold text-gray-900">
                Delivery Verification
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 rounded-full p-1.5"
            >
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-500 mb-1">
            {stop.label} · {stop.address}
          </Text>
          <Text className="text-xs text-blue-500 font-medium mb-6">
            Ask the customer for their OTP
          </Text>

          <Animated.View
            style={{ transform: [{ translateX: shakeAnim }] }}
            className="flex-row justify-center gap-3 mb-2"
          >
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputRefs.current[i] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, i)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isVerifying}
                className={`w-14 h-14 border-2 rounded-lg text-center text-2xl font-bold
                  ${
                    error
                      ? "border-red-400 bg-red-50 text-red-700"
                      : digit
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-gray-200 bg-gray-50 text-gray-800"
                  }`}
              />
            ))}
          </Animated.View>

          {error ? (
            <Text className="text-red-500 text-xs text-center mt-1 mb-4">
              {error}
            </Text>
          ) : (
            <View className="mb-4 h-5" />
          )}

          <TouchableOpacity
            className="py-3.5 rounded-md flex-row justify-center items-center gap-2 bg-yellow-500 disabled:opacity-50"
            onPress={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Verify & Complete Delivery
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
