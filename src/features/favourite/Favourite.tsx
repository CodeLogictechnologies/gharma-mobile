import {
  useGetFavouriteList,
  useRemoveToFavourite,
} from "@/features/favourite/hooks";
import { FavouriteItem } from "@/features/favourite/types";
import { formatPrice } from "@/libs/formatPrice";
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
      <View className="bg-white rounded-xl p-3 flex-row mb-3 shadow-xs border border-gray-100">
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
                {formatPrice(item.price)}
              </Text>
              <Text className="text-gray-900 font-bold text-sm">
                {formatPrice(item.price)}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <TouchableOpacity
              onPress={() => {
                removeFromFav(item?.variationid);
              }}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-1"
            >
              <Trash2 color="#94a3b8" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              className="bg-primary p-2.5 rounded-lg shadow-xs"
            >
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
        <View className="w-20 h-20 rounded-full bg-primary-tint items-center justify-center">
          <Heart size={36} color="#d7a11b" strokeWidth={1.5} />
        </View>
        <Text className="text-lg font-inter-bold text-gray-700 mt-4 text-center">
          No Favourites Found
        </Text>
        <Text className="text-sm text-gray-400 mt-1 text-center">
          Tap the heart on any product to save it here
        </Text>
      </View>
    ),
    [],
  );

  const ListFooterComponent = useCallback(
    () =>
      isFetchingNextPage ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#d7a11b" />
        </View>
      ) : null,
    [isFetchingNextPage],
  );

  if (!token) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle={"dark-content"} />
        <View className="bg-white p-4 flex-row justify-between items-center border-b border-slate-100">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-1"
          >
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-inter-bold text-slate-900">
            My Favourites
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                router.navigate("/(app)/cartlist");
              }}
            >
              <ShoppingCart size={22} color="#0f172a" />
            </TouchableOpacity>
            <Search size={22} color="#0f172a" />
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
            activeOpacity={0.8}
            className="mt-6 bg-primary px-8 py-3 rounded-xl shadow-sm"
          >
            <Text className="text-white font-inter-bold text-sm">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle={"dark-content"} />
        <View className="bg-white p-4 flex-row justify-between items-center border-b border-slate-100">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-1"
          >
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-inter-bold text-slate-900">
            My Favourites
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                router.navigate("/(app)/cartlist");
              }}
            >
              <ShoppingCart size={22} color="#0f172a" />
            </TouchableOpacity>
            <Search size={22} color="#0f172a" />
          </View>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="small" color="#d7a11b" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle={"dark-content"} />
      <View className="bg-white p-4 flex-row justify-between items-center border-b border-slate-100">
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-1"
        >
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-inter-bold text-slate-900">
          My Favourites
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => {
              router.navigate("/(app)/cartlist");
            }}
          >
            <ShoppingCart size={22} color="#0f172a" />
          </TouchableOpacity>
          <Search size={22} color="#0f172a" />
        </View>
      </View>

      <FlatList
        data={favouriteList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#d7a11b"
            colors={["#d7a11b"]}
          />
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
            activeOpacity={0.8}
            className={`bg-primary py-3.5 rounded-xl shadow-sm ${
              false ? "opacity-70" : ""
            }`}
          >
            {false ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-inter-bold text-base">
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
