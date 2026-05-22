import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
  const pickImage = async (onChange: (uri: string) => void) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) onChange(result.assets[0].uri);
  };

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
