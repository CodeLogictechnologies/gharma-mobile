import {
  useGetFavouriteList,
  useRemoveToFavourite,
} from "@/screen/favourite/hooks";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, ShoppingCart, Trash2 } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FavouriteList = () => {
  const router = useRouter();

  const { data, isLoading } = useGetFavouriteList();

  const favouriteList = data?.favourite;

  console.log("favouriteList", favouriteList);

  const { mutate: removeFromFav } = useRemoveToFavourite();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle={"light-content"} />
      <View className="bg-yellow pt-8 pb-3 px-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft color="white" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">My Favourites</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => {
              router.navigate("/(app)/(tabs)/(home)/cartlist");
            }}
          >
            <ShoppingCart color="white" size={22} />
          </TouchableOpacity>
          <Search color="white" size={22} />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
      >
        {favouriteList?.map((item, index) => (
          <View
            key={index}
            className="bg-white rounded-md p-3 flex-row mb-4 shadow-xs border border-gray-100"
          >
            <Image
              source={{ uri: item.image }}
              className="w-24 h-24 rounded-xl bg-gray-100"
              resizeMode="cover"
            />

            <View className="flex-1 ml-4 justify-between">
              <View>
                <Text
                  className="text-gray-800 font-medium text-sm leading-tight"
                  numberOfLines={2}
                >
                  {item?.itemname}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {/* {item.variant} */}Multicolor
                </Text>
                <View className="flex-row items-center mt-1 gap-2">
                  <Text className="text-gray-400 line-through text-xs">
                    Rs. {item.price}
                  </Text>
                  <Text className="text-gray-900 font-bold text-sm">
                    Rs. {item.price}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <TouchableOpacity
                  onPress={() => {
                    removeFromFav(item?.variationid);
                  }}
                >
                  <Trash2 color="#cbd5e1" size={20} />
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#3da9d2] p-2 rounded-lg">
                  <ShoppingCart color="white" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="">
        <TouchableOpacity className="py-3 items-center justify-center bg-primary">
          <Text className="text-white text-sm font-bold tracking-widest">
            ADD ALL TO CART
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default FavouriteList;
