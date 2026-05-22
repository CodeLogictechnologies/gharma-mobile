import { router } from "expo-router";
import {
  BadgePercent,
  Bell,
  Briefcase,
  Camera,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  FileText,
  Headset,
  Heart,
  History,
  LayoutGrid,
  LogOut,
  Mail,
  Pencil,
  Phone,
  RefreshCcw,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Ticket,
  Truck,
  UserCog,
} from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogOut } from "../auth/login/hooks";
import MenuItem from "./component/MenuItem";
import { useGetUserDetails } from "./hooks";

const menuSections = [
  [
    {
      icon: ShoppingBag,
      title: "My Orders",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: Truck,
      title: "Delivery Address",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: Briefcase,
      title: "Business Details",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      onPress: () => {
        console.log("Press");
      },
    },
  ],
  [
    {
      icon: History,
      title: "Recently Viewed",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: Heart,
      title: "Favourite Products",
      onPress: () => {
        router.navigate("/favourite");
      },
    },
  ],
  [
    {
      icon: UserCog,
      title: "My Preferences",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: ShieldCheck,
      title: "Privacy Settings",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: LayoutGrid,
      title: "App Settings",
      onPress: () => {
        console.log("Press");
      },
    },
  ],
  [
    {
      icon: RotateCcw,
      title: "Returns & Refunds",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: BadgePercent,
      title: "Discounts & Offers Policy",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: FileText,
      title: "Terms Of Services",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: ShieldCheck,
      title: "Privacy Policy",
      onPress: () => {
        console.log("Press");
      },
    },
    {
      icon: RefreshCcw,
      title: "Check For Updates",
      onPress: () => {
        console.log("Checking for updates...");
      },
    },
    {
      icon: Star,
      title: "Rate Us!",
      onPress: () => {
        console.log("Open rating modal");
      },
    },
  ],
];

const Profile = () => {
  const { data, isPending } = useGetUserDetails();
  const user = data?.data;

  const { mutate: logout } = useLogOut();

  if (isPending)
    return (
      <View className="flex-1 justify-center items-center bg-[#F0F1E1]">
        <Text className=" font-medium">Loading profile...</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-secondary">
      <SafeAreaView edges={["top"]} className="px-4 py-1">
        <View className="flex-row justify-between items-center px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-0.5 border-black border rounded-full"
          >
            <ChevronLeft color="black" size={14} />
          </TouchableOpacity>
          <View className="flex-row gap-16 items-center">
            <Text className="text-lg font-bold">Profile</Text>
            <View className="flex-row gap-4 items-center">
              <Headset color="black" size={16} strokeWidth={2} />
              <Bell color="black" size={16} strokeWidth={2} />
              <Settings color="black" size={16} strokeWidth={2} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 "
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative mt-1 mb-2">
          <Image
            source={{
              uri:
                user?.image ||
                "data:image/png;base64,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",
            }}
            className="w-20 h-20 rounded-full border-2 border-white bg-white shadow-sm"
          />
          <TouchableOpacity className="absolute bottom-1 right-0.5 ">
            <View className="bg-primary p-1.5 rounded-full">
              <Camera color="white" size={13} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-3 mb-1 pl-4">
          <Text className="text-lg font-extrabold  text-center">
            {user?.first_name} {user?.middle_name} {user?.last_name}
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: "/(app)/profileupdate",
                params: { ...user },
              })
            }
          >
            <Pencil color="black" size={14} />
          </TouchableOpacity>
        </View>

        <View className="w-full items-center gap-2">
          {user?.phone && (
            <View className="flex-row items-center gap-3">
              <Phone color="black" size={10} />
              <Text className=" text-x font-medium tracking-tight">
                +977 {user?.phone}
              </Text>
            </View>
          )}

          {user?.email && (
            <View className="flex-row items-center gap-3">
              <Mail color="black" size={16} />
              <Text className=" text-xs font-medium tracking-tight">
                {user?.email}
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white flex-1 w-full mt-4 rounded-t-2xl p-4">
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity className="flex-1 border border-orange-200 rounded-lg p-3 items-center bg-white shadow-xs">
              <View className="flex-row items-center gap-2 mb-1">
                <Ticket color="#f97316" size={18} />
                <Text className="font-semibold text-sm">Vouchers</Text>
                <ChevronRight color="#f97316" size={14} />
              </View>
              <Text className="text-md font-bold">109</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 border border-orange-200 rounded-md p-3 items-center bg-white shadow-xs">
              <View className="flex-row items-center gap-2 mb-1">
                <Coins color="#f97316" size={18} />
                <Text className="font-semibold text-sm">Loyalty Points</Text>
                <ChevronRight color="#f97316" size={14} />
              </View>
              <Text className="text-md font-bold">10029</Text>
            </TouchableOpacity>
          </View>
          {menuSections.map((section, sectionIndex) => (
            <View
              key={sectionIndex}
              className="bg-white rounded-lg px-4 mb-4 border border-gray-200"
            >
              {section.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  onPress={item.onPress}
                  isLast={index === section.length - 1}
                />
              ))}
            </View>
          ))}
          <TouchableOpacity
            onPress={() => 
               
              logout()}
            className="flex-row items-center justify-center border border-red-400 rounded-lg py-2.5 mt-2"
          >
            <LogOut color="#ff4d4d" size={20} />
            <Text className="text-red-500 font-bold text-md ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
