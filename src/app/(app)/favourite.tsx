import {
  useGetFavouriteList,
  useRemoveToFavourite,
} from "@/screen/favourite/hooks";
import { FavouriteItem } from "@/screen/favourite/types";
import { useAuthStore } from "@/store/useAuth";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Heart,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Favourite = () => {
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetFavouriteList();

  const favouriteList = useMemo(
    () => data?.pages.flatMap((page) => page.favourite) ?? [],
    [data],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const { mutate: removeFromFav } = useRemoveToFavourite();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)/(home)");
    }
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: FavouriteItem }) => (
      <View className="bg-white rounded-md p-3 flex-row mb-4 shadow-xs border border-gray-100">
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
            <Text className="text-gray-400 text-xs mt-1">Multicolor</Text>
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
    ),
    [removeFromFav],
  );

  const keyExtractor = useCallback(
    (item: FavouriteItem) => item.favouriteid,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View className="flex-1 items-center justify-center px-8 py-20">
        <Heart size={64} color="#d1d5db" strokeWidth={1.5} />
        <Text className="text-lg font-bold text-gray-400 mt-4 text-center">
          No Favourites Found
        </Text>
      </View>
    ),
    [],
  );

  const ListFooterComponent = useCallback(
    () =>
      isFetchingNextPage ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#06812f" />
        </View>
      ) : null,
    [isFetchingNextPage],
  );

  if (!token) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle={"dark-content"} />
        <View className="bg-white p-4 flex-row justify-between items-center border-b border-gray-200">
          <TouchableOpacity onPress={handleBack} className="p-1">
            <ArrowLeft size={20} />
          </TouchableOpacity>
          <Text className="text-lg font-bold">My Favourites</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                router.navigate("/(app)/cartlist");
              }}
            >
              <ShoppingCart size={22} />
            </TouchableOpacity>
            <Search size={22} />
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Heart size={64} color="#d1d5db" strokeWidth={1.5} />
          <Text className="text-lg font-bold text-gray-400 mt-4 text-center">
            No Favourites Found
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center">
            Please log in to view your favourites
          </Text>
          <TouchableOpacity
            onPress={() => router.navigate("/login")}
            className="mt-6 bg-primary px-8 py-3 rounded-md"
          >
            <Text className="text-white font-bold text-sm">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle={"dark-content"} />
        <View className="bg-white p-4 flex-row justify-between items-center border-b border-gray-200">
          <TouchableOpacity onPress={handleBack} className="p-1">
            <ArrowLeft size={20} />
          </TouchableOpacity>
          <Text className="text-lg font-bold">My Favourites</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                router.navigate("/(app)/cartlist");
              }}
            >
              <ShoppingCart size={22} />
            </TouchableOpacity>
            <Search size={22} />
          </View>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="small" color="#06812f" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle={"dark-content"} />
      <View className="bg-white p-4 flex-row justify-between items-center border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <ArrowLeft size={20} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">My Favourites</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => {
              router.navigate("/(app)/cartlist");
            }}
          >
            <ShoppingCart size={22} />
          </TouchableOpacity>
          <Search size={22} />
        </View>
      </View>

      <FlatList
        data={favouriteList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
      />

      {token && (
        <View
          className="bg-white px-4 pt-3"
          style={{ paddingBottom: insets.bottom }}
        >
          <TouchableOpacity
            className={`bg-primary py-2.5 rounded-md ${
              false ? "opacity-70" : ""
            }`}
          >
            {false ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                ADD ALL TO CART
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Favourite;
