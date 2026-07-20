import {
  FormDocumentImagePicker,
  FormProfileImagePicker,
} from "@/components/common/FormImagePicker";
import FormInput from "@/components/common/FormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as yup from "yup";
import { useRetailerRegister, useWholesalerRegister } from "./hooks";

type Role = "retailer" | "wholesaler";

const baseSchema = {
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
};

const retailerSchema = yup.object(baseSchema);

const wholesalerSchema = yup.object({
  ...baseSchema,
  company_name: yup.string().required("Company name is required"),
  tax_number: yup.string().required("Tax number is required"),
  registration_number: yup.string().required("Registration number is required"),
  registration_number_image: yup.string().ensure(),
  pan_number: yup.string().ensure(),
  pan_image: yup.string().ensure(),
});

export type RetailerFormData = yup.InferType<typeof retailerSchema>;
export type WholesalerFormData = yup.InferType<typeof wholesalerSchema>;
type FormData = WholesalerFormData;

const defaultValues: FormData = {
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
  company_name: "",
  tax_number: "",
  registration_number: "",
  registration_number_image: "",
  pan_number: "",
  pan_image: "",
};

const SectionDivider = ({ label }: { label: string }) => (
  <View className="flex-row items-center gap-2 my-4">
    <View className="flex-1 h-px bg-gray-100" />
    <Text className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
      {label}
    </Text>
    <View className="flex-1 h-px bg-gray-100" />
  </View>
);

const Register = () => {
  const [role, setRole] = useState<Role>("retailer");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(
      role === "retailer" ? retailerSchema : wholesalerSchema,
    ) as any,
    defaultValues,
  });

  const retailerMutation = useRetailerRegister();
  const wholesalerMutation = useWholesalerRegister();
  const isPending =
    role === "retailer"
      ? retailerMutation.isPending
      : wholesalerMutation.isPending;

  const onSubmit = (data: FormData) => {
    if (role === "retailer") {
      retailerMutation.mutate(data as RetailerFormData);
    } else {
      wholesalerMutation.mutate(data as WholesalerFormData);
    }
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={100}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      className="bg-white"
    >
      <View className="flex-1 px-5 pt-6 pb-10">
        <Text className="text-[22px] font-medium text-center text-gray-900 mb-5">
          Create account
        </Text>

        <View className="items-center mb-5">
          <FormProfileImagePicker
            control={control}
            name="image"
            label="Profile Photo"
          />
        </View>

        <View className="flex-row bg-gray-100 rounded-xl p-1 gap-1 mb-5">
          {(["retailer", "wholesaler"] as Role[]).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              activeOpacity={0.7}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[10px] ${
                role === r ? "bg-white border border-gray-200" : ""
              }`}
            >
              <View
                className={`w-3.5 h-3.5 rounded-full border items-center justify-center ${
                  role === r ? "border-primary" : "border-gray-400"
                }`}
              >
                {role === r && (
                  <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </View>
              <Text
                className={`text-sm capitalize ${
                  role === r ? "font-medium text-primary" : "text-gray-500"
                }`}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionDivider label="Personal info" />

        <View className="flex-row gap-2">
          <View className="flex-1">
            <FormInput
              control={control}
              name="first_name"
              label="First name"
              errorMessage={errors.first_name?.message}
            />
          </View>
          <View className="flex-1">
            <FormInput
              control={control}
              name="middle_name"
              label="Middle name"
              errorMessage={errors.middle_name?.message}
            />
          </View>
          <View className="flex-1">
            <FormInput
              control={control}
              name="last_name"
              label="Last name"
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
          label="Email address"
          errorMessage={errors.email?.message}
          keyboardType="email-address"
        />
        <FormInput
          control={control}
          name="phone"
          label="Mobile number"
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

        <View className="mb-3">
          <Text className="text-xs font-medium text-gray-500 mb-1.5">
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
                    activeOpacity={0.7}
                    className={`flex-1 py-2 rounded-[10px] border ${
                      value === opt
                        ? "bg-primary border-primary"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-center text-sm capitalize ${
                        value === opt
                          ? "text-white font-medium"
                          : "text-gray-500"
                      }`}
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

        <View className="flex-row gap-2">
          <View className="flex-1">
            <FormInput
              control={control}
              name="password"
              label="Password"
              errorMessage={errors.password?.message}
              secureTextEntry
            />
          </View>
          <View className="flex-1">
            <FormInput
              control={control}
              name="password_confirmation"
              label="Confirm password"
              errorMessage={errors.password_confirmation?.message}
              secureTextEntry
            />
          </View>
        </View>

        {role === "wholesaler" && (
          <>
            <SectionDivider label="Business details" />

            <FormInput
              control={control}
              name="company_name"
              label="Company name"
              errorMessage={(errors as any).company_name?.message}
            />

            <View className="flex-row gap-2">
              <View className="flex-1">
                <FormInput
                  control={control}
                  name="tax_number"
                  label="Tax number"
                  errorMessage={(errors as any).tax_number?.message}
                />
              </View>
              <View className="flex-1">
                <FormInput
                  control={control}
                  name="registration_number"
                  label="Registration no."
                  errorMessage={(errors as any).registration_number?.message}
                />
              </View>
            </View>

            <FormInput
              control={control}
              name="pan_number"
              label="PAN number (optional)"
              errorMessage={(errors as any).pan_number?.message}
            />

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-500 mb-1.5">
                  Registration image
                </Text>
                <FormDocumentImagePicker
                  control={control}
                  name="registration_number_image"
                  label="Registration Certificate"
                  placeholder="Upload Registration"
                />
                {(errors as any).registration_number_image && (
                  <Text className="text-red-500 text-xs mt-1">
                    {(errors as any).registration_number_image.message}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-500 mb-1.5">
                  PAN image
                </Text>
                <FormDocumentImagePicker
                  control={control}
                  name="pan_image"
                  label="PAN Card"
                  placeholder="Upload PAN card"
                />
                {(errors as any).pan_image && (
                  <Text className="text-red-500 text-xs mt-1">
                    {(errors as any).pan_image.message}
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className={`bg-primary py-3.5 rounded-xl shadow-sm items-center justify-center mt-5 ${
            isPending ? "opacity-60" : ""
          }`}
        >
          {isPending && <ActivityIndicator color="white" className="mr-2" />}
          <Text className="text-white font-medium text-[15px]">
            Create account
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Register;
