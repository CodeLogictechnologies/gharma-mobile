import FormInput from "@/components/common/FormInput";
import { yupResolver } from "@hookform/resolvers/yup";
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
import { useChangePassword } from "./hooks";

const changePasswordSchema = yup.object({
  current_password: yup.string().required("Current Password is required"),
  password: yup
    .string()
    .required("New Password is required")
    .min(6, "Password must be at least 6 characters"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;

const ChangePassword = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const { mutate, isPending } = useChangePassword();

  const onSubmit = async (data: ChangePasswordFormData) => {
    console.log("Form Data:", data);
    mutate(data);
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
        <View className="flex-1 px-6 pt-10 pb-8 justify-start">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Change Password
          </Text>
          <Text className="text-sm text-gray-500 mb-8">
            Please enter your current password and choose a new one.
          </Text>

          <FormInput
            control={control}
            name="current_password"
            label="Current Password"
            errorMessage={errors.current_password?.message}
            placeholder="********"
            secureTextEntry
          />

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
            className={`bg-primary py-3.5 rounded-xl shadow-sm mb-6 ${
              isPending ? "opacity-70" : ""
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;
