import { useBrandList } from "@/screen/brand/hooks";
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

const BrandSkeleton = () => {
  return (
    <View className="w-[22%] items-center mb-5">
      <View className="aspect-square w-full bg-[#f4f4f4] rounded-md p-2 mb-2 flex items-center justify-center animate-pulse">
        <View className="w-10 h-10 bg-gray-200 rounded-full" />
      </View>
      <View className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
    </View>
  );
};

const BrandCard = ({ item }: { item: any }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        // router.navigate({
        //   pathname: "/brand-products",
        //   params: { brandName: item?.name, brandId: item?.id },
        // });
      }}
      className="w-[22%] items-center mb-5"
    >
      <View className="aspect-square w-full bg-[#f4f4f4] rounded-md p-2 mb-2 flex items-center justify-center">
        <Image
          source={{ uri: item?.image_url }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      <Text
        className="text-sm font-medium text-[#2d2d2d] text-center"
        numberOfLines={2}
      >
        {item?.name}
      </Text>
    </TouchableOpacity>
  );
};

const Brand = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isPending, refetch } = useBrandList();
  const brands = data?.data || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <>
      <View className=" p-4 flex-row justify-between items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={20} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ">Brands</Text>
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
                  <BrandSkeleton key={idx} />
                ))
              : brands.map((item: any) => (
                  <BrandCard key={item?.id} item={item} />
                ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Brand;
