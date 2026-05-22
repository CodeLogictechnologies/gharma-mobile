import FormInput from "@/components/common/FormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
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
import { useForgotPassword } from "./hooks";

const forgotPasswordSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

export interface ForgotPasswordFormData extends yup.InferType<
  typeof forgotPasswordSchema
> {}

const ForgotPassword = () => {
  const router = useRouter();
  const { mutate, isPending } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutate(data, {
      onSuccess: () => {
        router?.navigate("/(auth)/verifyotp");
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
            FORGOT PASSWORD
          </Text>
          <Text className="text-center text-gray-500 mb-8">
            Provide your account's email for which you want to reset your
            password
          </Text>

          <FormInput
            control={control}
            name="email"
            label="Email Address"
            errorMessage={errors.email?.message}
            keyboardType="email-address"
            placeholder="you@example.com"
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

export default ForgotPassword;
