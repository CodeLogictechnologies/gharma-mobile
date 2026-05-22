import FormInput from "@/components/common/FormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";
import { useResetPassword } from "./hooks";

const resetPasswordSchema = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
  password: yup
    .string()
    .required("New Password is required")
    .min(6, "Password must be at least 6 characters"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export interface ResetPasswordFormData extends yup.InferType<
  typeof resetPasswordSchema
> {}

const ResetPassword = () => {
  const router = useRouter();
  const { otp } = useLocalSearchParams<{ otp: string }>();

  const { mutate, isPending } = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      otp: otp || "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    mutate(data, {
      onSuccess: () => {
        router.replace("/(auth)/login");
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
        <View className="flex-1 px-6 pt-5 pb-8">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
            NEW CREDENTIALS
          </Text>
          <Text className="text-center text-gray-500 mb-8">
            Enter your new password below.
          </Text>

          <FormInput
            control={control}
            name="password"
            label="New Password"
            errorMessage={errors.password?.message}
            placeholder="Min 6 characters"
            secureTextEntry
          />
          <FormInput
            control={control}
            name="password_confirmation"
            label="Confirm New Password"
            errorMessage={errors.password_confirmation?.message}
            placeholder="Repeat new password"
            secureTextEntry
          />

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`bg-primary py-2.5 rounded-md flex-row justify-center items-center ${isPending ? "opacity-70" : ""}`}
          >
            {isPending && <ActivityIndicator color="white" className="mr-2" />}
            <Text className="text-white font-semibold">Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;
