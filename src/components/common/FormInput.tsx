// components/FormInput.tsx
import React from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  errorMessage?: string;
  prefix?: string; // e.g. "+977" for phone fields
}

const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  errorMessage,
  prefix,
  ...textInputProps
}: FormInputProps<T>) => {
  return (
    <View className="mb-2">
      <Text className="text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </Text>

      <View
        className={`flex-row items-center border border-gray-300 rounded-md bg-gray-50 px-3 ${errorMessage ? "border-red-400" : ""}`}
      >
        {prefix && (
          <Text className="text-gray-600 font-medium mr-2">{prefix}</Text>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="flex-1 py-2.5 text-gray-800"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              {...textInputProps}
            />
          )}
        />
      </View>

      {errorMessage && (
        <Text className="text-red-500 text-xs mt-1">{errorMessage}</Text>
      )}
    </View>
  );
};

export default FormInput;
