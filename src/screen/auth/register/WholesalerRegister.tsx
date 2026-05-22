import FormImagePicker from "@/components/common/FormImagePicker";
import FormInput from "@/components/common/FormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
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
import { useWholesalerRegister } from "./hooks";

const wholesalerRegisterSchema = yup.object({
  username: yup.string().required("Username is required"),
  first_name: yup.string().required("First name is required"),
  middle_name: yup.string().ensure(),
  last_name: yup.string().ensure(),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit number"),
  address: yup.string().required("Address is required"),
  gender: yup
    .string()
    .oneOf(["male", "female", "other"])
    .required("Gender is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "At least 6 characters"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
  image: yup.string().ensure(),
  company_name: yup.string().required("Company Name is required"),
  tax_number: yup.string().required("Tax Number is required"),
  registration_number: yup.string().required("Registration Number is required"),
});

export interface WholesalerRegisterFormData extends yup.InferType<
  typeof wholesalerRegisterSchema
> {}

const WholesalerRegister = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WholesalerRegisterFormData>({
    resolver: yupResolver(wholesalerRegisterSchema),
    defaultValues: {
      username: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      gender: "male",
      password: "",
      password_confirmation: "",
      image: "",
    },
  });

  const { mutate, isPending } = useWholesalerRegister();

  const onSubmit = (data: WholesalerRegisterFormData) => {
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
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-5 pb-8">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </Text>

          <View className="items-center mb-2">
            <FormImagePicker control={control} name="image" />
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <FormInput
                control={control}
                name="first_name"
                label="First Name"
                errorMessage={errors.first_name?.message}
              />
            </View>
            <View className="flex-1">
              <FormInput
                control={control}
                name="middle_name"
                label="Middle Name"
                errorMessage={errors.middle_name?.message}
              />
            </View>
            <View className="flex-1">
              <FormInput
                control={control}
                name="last_name"
                label="Last Name"
                errorMessage={errors.last_name?.message}
              />
            </View>
          </View>

          <FormInput
            control={control}
            name="username"
            label="Username"
            errorMessage={errors.username?.message}
            autoCapitalize="none"
          />

          <FormInput
            control={control}
            name="email"
            label="Email Address"
            errorMessage={errors.email?.message}
            keyboardType="email-address"
          />

          <FormInput
            control={control}
            name="phone"
            label="Mobile Number"
            errorMessage={errors.phone?.message}
            prefix="+977"
            keyboardType="phone-pad"
            maxLength={10}
          />

          <FormInput
            control={control}
            name="address"
            label="Address"
            errorMessage={errors.address?.message}
            placeholder="Kathmandu, Nepal"
          />

          <View className="mb-2">
            <Text className="text-sm font-semibold text-gray-700 mb-1.5">
              Gender
            </Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-2">
                  {["male", "female", "other"].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => onChange(opt)}
                      className={`flex-1 py-2 rounded-md border ${value === opt ? "bg-primary border-primary" : "border-gray-300"}`}
                    >
                      <Text
                        className={`text-center capitalize ${value === opt ? "text-white" : "text-gray-700"}`}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.gender && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.gender.message}
              </Text>
            )}
          </View>

          <FormInput
            control={control}
            name="password"
            label="Password"
            errorMessage={errors.password?.message}
            secureTextEntry
          />

          <FormInput
            control={control}
            name="password_confirmation"
            label="Confirm Password"
            errorMessage={errors.password_confirmation?.message}
            secureTextEntry
          />

          <FormInput
            control={control}
            name="company_name"
            label="Company Name"
            errorMessage={errors.company_name?.message}
          />
          <FormInput
            control={control}
            name="tax_number"
            label="Tax Number"
            errorMessage={errors.tax_number?.message}
          />
          <FormInput
            control={control}
            name="registration_number"
            label="Registration Number"
            errorMessage={errors.registration_number?.message}
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

export default WholesalerRegister;
