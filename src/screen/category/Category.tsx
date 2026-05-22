import { ArrowLeft, ChevronDown, Search } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useGetCatrgoryList } from "./hooks";
import { Category as CategoryType } from "./types";

const CategoryCard = ({ item }: { item: CategoryType }) => (
  <View className="w-[48%] bg-[#ffffff] rounded-xl p-3 mb-4 shadow-sm">
    <View className="aspect-square w-full mb-3 rounded-md overflow-hidden flex items-center justify-center">
      <Image
        source={{ uri: item?.image }}
        className="w-full h-full"
        resizeMode="contain"
      />
    </View>
    <View className="flex-row items-center justify-center">
      <Text className="text-base font-semibold text-black">{item?.title}</Text>

      <ChevronDown size={16} color="black" style={{ marginLeft: 4 }} />
    </View>
  </View>
);

const Category = () => {
  const { data, isPending } = useGetCatrgoryList();
  return (
    <>
      <View className="bg-white p-4 flex-row justify-between items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => {}} className="p-1">
          <ArrowLeft size={20} />
        </TouchableOpacity>
        <Text className=" text-lg font-bold">Categories</Text>
        <View className="flex-row gap-4">
          <Search size={22} />
        </View>
      </View>
      <View className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
          className="flex-1 z-20"
        >
          <View className="flex-row flex-wrap justify-between">
            {data?.categories.map((item) => (
              <CategoryCard key={item?.categortid} item={item} />
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Category;
