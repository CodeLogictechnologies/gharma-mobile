import { router } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CategorySkeleton from "./component/CategorySkeleton";
import { useGetCatrgoryList } from "./hooks";
import { Category as CategoryType } from "./types";

const CategoryCard = ({ item }: { item: CategoryType }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        router.navigate({
          pathname: "/subcategory",
          params: { categoryTitle: item?.title, categoryId: item?.categoryid },
        });
      }}
      className="w-[22%] items-center mb-5"
    >
      <View className="aspect-square w-full bg-[#f4f4f4] rounded-md p-2 mb-2 flex items-center justify-center">
        <Image
          source={{ uri: item?.image }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      <Text
        className="text-sm font-medium text-[#2d2d2d] text-center"
        numberOfLines={2}
      >
        {item?.title}
      </Text>
    </TouchableOpacity>
  );
};

const Category = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isPending, refetch } = useGetCatrgoryList();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-row flex-wrap justify-between">
            {isPending
              ? Array.from({ length: 12 }).map((_, idx) => (
                  <CategorySkeleton key={idx} />
                ))
              : data?.categories.map((item) => (
                  <CategoryCard key={item?.categoryid} item={item} />
                ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Category;
