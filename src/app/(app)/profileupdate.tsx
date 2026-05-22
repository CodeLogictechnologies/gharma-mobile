import FormInput from "@/components/common/FormInput";
import { useProfileUupdate } from "@/screen/profile/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, ChevronLeft } from "lucide-react-native";
import React from "react";
import { Resolver, useForm } from "react-hook-form";
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
import { SafeAreaView } from "react-native-safe-area-context";
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

  const imageUrl = String(params.image || "");

  const { mutate, isPending } = useProfileUupdate();

  const onSubmit = async (data: ProfileUpdateFormData) => {
    mutate(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="bg-yellow pt-2 pb-6 px-4">
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1 border border-white rounded-full"
            >
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Edit Profile</Text>
            <View className="w-8" />
          </View>
        </SafeAreaView>

        <View className="items-center mt-4">
          <View className="relative">
            <Image
              source={{
                uri:
                  imageUrl ||
                  "data:image/png;base64,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",
              }}
              className="w-24 h-24 rounded-full border-2 border-white bg-gray-100"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-[#46BDCD] p-2 rounded-full border-2 border-white">
              <Camera color="white" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="px-6 pt-6"
      >
        <View className="flex-1 pb-10">
          <FormInput
            control={control}
            name="username"
            label="Username"
            errorMessage={errors.username?.message}
            placeholder="john_doe"
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

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`py-2.5 rounded-md my-6 bg-yellow ${
              isPending ? "opacity-70" : ""
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Update Profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileUpdate;
