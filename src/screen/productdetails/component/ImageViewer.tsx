import { ChevronLeft } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { SharedTransition } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const transition = SharedTransition.duration(350);

type Props = {
  visible: boolean;
  images: string[];
  index: number;
  onClose: () => void;
};

const ImageViewerModal = ({ visible, images, index, onClose }: Props) => {
  const listRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(index);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-8 left-4 z-50 p-2"
        >
          <ChevronLeft color="white" size={20} />
        </TouchableOpacity>

        <Text className="absolute top-8 right-4 text-white z-50">
          {activeIndex + 1} / {images.length}
        </Text>

        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={index}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          getItemLayout={(_, i) => ({
            length: width,
            offset: width * i,
            index: i,
          })}
          onScroll={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(i);
          }}
          renderItem={({ item, index }) => (
            <View style={{ width, height }}>
              <Animated.Image
                source={{ uri: item }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
                sharedTransitionTag={`image-${index}`}
                sharedTransitionStyle={transition}
              />
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

export default ImageViewerModal;
