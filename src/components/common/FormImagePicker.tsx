import * as DocumentPicker from "expo-document-picker";
import { Camera } from "lucide-react-native";
import React from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";

type ImageType = "profile" | "document";

interface BasePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  type: ImageType;
}

const pickImage = async (onChange: (uri: string) => void) => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "image/*",
    copyToCacheDirectory: true,
  });
  if (!result.canceled) onChange(result.assets[0].uri);
};

interface FormProfileImagePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
}

export const FormProfileImagePicker = <T extends FieldValues>({
  control,
  name,
  label = "Profile Photo",
}: FormProfileImagePickerProps<T>) => {
  return (
    <View className="items-center mb-5">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            onPress={() => pickImage(onChange)}
            activeOpacity={0.8}
            className="h-28 w-28 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 items-center justify-center overflow-hidden relative"
          >
            {value ? (
              <Image
                source={{ uri: value }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Camera color={"gray"} />
                <Text className="text-gray-400 text-[11px]">Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      <Text className="text-xs text-gray-500 mt-2 font-medium">{label}</Text>
    </View>
  );
};

interface FormDocumentImagePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
}

export const FormDocumentImagePicker = <T extends FieldValues>({
  control,
  name,
  label = "Document Image",
  placeholder = "Tap to upload document image",
}: FormDocumentImagePickerProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TouchableOpacity
          onPress={() => pickImage(onChange)}
          activeOpacity={0.8}
          className={`w-full rounded-xl border-2 border-dashed overflow-hidden ${
            value
              ? "border-primary bg-primary/5"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          {value ? (
            <View className="relative">
              <Image
                source={{ uri: value }}
                className="w-full h-40"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1.5">
                <Text className="text-white text-xs text-center font-medium">
                  Tap to change
                </Text>
              </View>
            </View>
          ) : (
            <View className="py-8 px-4 items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mb-2">
                <Text className="text-xl">📄</Text>
              </View>
              <Text className="text-gray-500 text-sm font-medium text-center">
                {placeholder}
              </Text>
              <Text className="text-gray-400 text-[11px] mt-1">
                JPG, PNG up to 5MB
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
};

// ─── Default export (backward compatible — acts as profile picker) ─

interface FormImagePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
}

const FormImagePicker = <T extends FieldValues>({
  control,
  name,
  label = "Store Representative Image",
}: FormImagePickerProps<T>) => {
  return (
    <View className="items-center mb-6">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            onPress={() => pickImage(onChange)}
            className="h-24 w-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 items-center justify-center overflow-hidden"
          >
            {value ? (
              <Image source={{ uri: value }} className="h-full w-full" />
            ) : (
              <Text className="text-gray-400 text-xs">Add Photo</Text>
            )}
          </TouchableOpacity>
        )}
      />
      <Text className="text-xs text-gray-500 mt-2">{label}</Text>
    </View>
  );
};

export default FormImagePicker;
