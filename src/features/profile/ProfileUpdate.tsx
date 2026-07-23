import FormInput from "@/components/common/FormInput";
import { useProfileUpdate } from "@/features/profile/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, ChevronLeft, User } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";

const ProfileUpdateSchema = yup.object({
  username: yup.string().required("Username is required"),
  first_name: yup.string().required("First name is required"),
  middle_name: yup.string().optional(),
  last_name: yup.string().required("Last name is required"),
  gender: yup.string().required("Gender is required"),
  address: yup.string().required("Address is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit number"),
  image: yup.string().nullable().optional(),
});

export type ProfileUpdateFormData = yup.InferType<typeof ProfileUpdateSchema>;

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const ProfileUpdate = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: yupResolver(
      ProfileUpdateSchema,
    ) as Resolver<ProfileUpdateFormData>,
    defaultValues: {
      username: String(params.username || ""),
      first_name: String(params.first_name || ""),
      middle_name: String(params.middle_name || ""),
      last_name: String(params.last_name || ""),
      gender: String(params.gender || ""),
      address: String(params.address || ""),
      phone: String(params.phone || ""),
      image: String(params.image || ""),
    },
  });

  const [avatarUri, setAvatarUri] = useState(String(params.image || ""));

  const { mutate, isPending } = useProfileUpdate();

  const onSubmit = async (data: ProfileUpdateFormData) => {
    mutate(data);
  };

  const handlePickImage = () => {
    // TODO: wire up expo-image-picker, then setAvatarUri(result.uri)
    // and setValue("image", result.uri)
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center px-4 border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-8 h-8 items-center justify-center"
        >
          <ChevronLeft color="#1f2937" size={22} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[15px] font-inter-bold text-slate-900 mr-8">
          Edit Profile
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-6 pb-2">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center overflow-hidden">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <User size={40} color="#94a3b8" strokeWidth={1.5} />
              )}
            </View>
            <TouchableOpacity
              onPress={handlePickImage}
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full items-center justify-center border-2 border-white"
            >
              <Camera color="white" size={13} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.7}
            className="mt-2"
          >
            <Text className="text-xs font-inter-semibold text-primary">
              {avatarUri ? "Change Photo" : "Add Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-4 pb-10">
          <FormInput
            control={control}
            name="username"
            label="Username"
            errorMessage={errors.username?.message}
            placeholder="john_doe"
            autoCapitalize="none"
          />

          <View className="flex-row gap-4">
            <View className="flex-1">
              <FormInput
                control={control}
                name="first_name"
                label="First Name"
                errorMessage={errors.first_name?.message}
                placeholder="John"
              />
            </View>
            <View className="flex-1">
              <FormInput
                control={control}
                name="last_name"
                label="Last Name"
                errorMessage={errors.last_name?.message}
                placeholder="Doe"
              />
            </View>
          </View>

          <FormInput
            control={control}
            name="middle_name"
            label="Middle Name (optional)"
            errorMessage={errors.middle_name?.message}
            placeholder="Kumar"
          />

          <View className="mb-4">
            <Text className="text-sm font-inter-semibold text-slate-700 mb-2">
              Gender
            </Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row gap-2">
                  {GENDER_OPTIONS.map((opt) => {
                    const isSelected = value === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        activeOpacity={0.7}
                        className={`flex-1 py-2.5 rounded-lg border items-center ${
                          isSelected
                            ? "bg-primary-tint border-primary"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-inter-semibold ${
                            isSelected ? "text-primary-dark" : "text-slate-600"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
            {errors.gender?.message && (
              <Text className="text-xs text-red-500 mt-1">
                {errors.gender.message}
              </Text>
            )}
          </View>

          <FormInput
            control={control}
            name="phone"
            label="Mobile Number"
            errorMessage={errors.phone?.message}
            prefix="+977"
            keyboardType="phone-pad"
            placeholder="9800000000"
            maxLength={10}
          />

          <FormInput
            control={control}
            name="address"
            label="Address"
            errorMessage={errors.address?.message}
            placeholder="Kathmandu, Nepal"
          />
        </View>
      </ScrollView>

      <View className="px-6 pb-6 pt-3 bg-white border-t border-slate-100">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          activeOpacity={0.85}
          className={`py-3.5 rounded-xl bg-primary ${
            isPending ? "opacity-70" : ""
          }`}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-inter-bold text-base">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ProfileUpdate;
