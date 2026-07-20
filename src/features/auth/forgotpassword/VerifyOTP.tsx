import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";
import { useVerifyOTP } from "./hooks";

const verifyOTPSchema = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

export interface VerifyOTPFormData extends yup.InferType<
  typeof verifyOTPSchema
> {}

const VerifyOTP = () => {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOTPFormData>({
    resolver: yupResolver(verifyOTPSchema),
    defaultValues: { otp: "" },
  });

  const { mutate, isPending } = useVerifyOTP();
  
  const onSubmit = (data: VerifyOTPFormData) => {
    console.log("otp", data);
    mutate(data, {
      onSuccess: (res) => {
        if (res?.type === "success") {
          router.push({
            pathname: "/(auth)/resetpassword",
            params: { otp: data.otp },
          });
        }
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-10 pb-8">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
            Verification Code
          </Text>
          <Text className="text-center text-gray-500 mb-8">
            Please enter the 6-digit code sent to your email.
          </Text>

          <View className="mb-8">
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={onChange}
                    maxLength={6}
                    keyboardType="number-pad"
                    className="absolute opacity-0 w-1 h-1"
                    caretHidden
                  />

                  <Pressable
                    onPress={() => inputRef.current?.focus()}
                    className="flex-row justify-between items-center"
                  >
                    {Array(6)
                      .fill(0)
                      .map((_, index) => {
                        const char = value[index] || "";
                        const isFocused = value.length === index;

                        return (
                          <View
                            key={index}
                            className={`w-12 h-14 border-2 rounded-lg justify-center items-center bg-gray-50 ${
                              isFocused ? "border-primary" : "border-gray-200"
                            } ${char ? "border-primary" : ""}`}
                          >
                            <Text className="text-2xl font-bold text-gray-800">
                              {char}
                            </Text>
                          </View>
                        );
                      })}
                  </Pressable>
                </View>
              )}
            />
            {errors.otp && (
              <Text className="text-red-500 text-center text-xs mt-4">
                {errors.otp.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`bg-primary py-3.5 rounded-xl flex-row justify-center items-center shadow-sm ${
              isPending ? "opacity-70" : ""
            }`}
          >
            {isPending && <ActivityIndicator color="white" className="mr-2" />}
            <Text className="text-white font-semibold">Verify & Proceed</Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-6">
            <Text className="text-center text-gray-500">
              Didn't receive code?{" "}
              <Text className="text-primary-dark font-inter-bold">Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyOTP;
