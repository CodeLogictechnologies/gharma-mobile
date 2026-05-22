import { useNavigation } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import NetworkLogger from "react-native-network-logger";

const NetworkScreen = () => {
  const navigation = useNavigation();
  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="border-medium h-7 w-7 items-center justify-center rounded-[10px] border-primary-light p-5"
      >
        <ArrowLeftIcon width={16} height={16} />
      </TouchableOpacity>
      <NetworkLogger />
    </View>
  );
};

export default NetworkScreen;
