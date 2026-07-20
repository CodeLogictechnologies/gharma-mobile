import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CategorySkeleton from "./components/CategorySkeleton";
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
      activeOpacity={0.7}
      className="w-[22%] items-center mb-5"
    >
      <View className="aspect-square w-full bg-slate-50 rounded-xl p-2 mb-2 flex items-center justify-center">
        <Image
          source={{ uri: item?.image }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      <Text
        className="text-xs font-inter-semibold text-slate-800 text-center leading-4"
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
      <View className="bg-white p-4 flex-row justify-between items-center border-b border-slate-100">
        <TouchableOpacity onPress={() => {}} className="p-1">
          {/* <ArrowLeft size={20} /> */}
        </TouchableOpacity>
        <Text className="text-lg font-inter-bold text-slate-900">
          Categories
        </Text>
        <View className="flex-row gap-4">{/* <Search size={22} /> */}</View>
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#d7a11b"
              colors={["#d7a11b"]}
            />
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
