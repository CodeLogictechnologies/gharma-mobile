import { X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ZoomableImage from "./ZoomableImage";

const { width, height } = Dimensions.get("window");

type ImageGalleryProps = {
  images: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  thumbnailLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex,
  visible,
  onClose,
  thumbnailLayout,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [contentReady, setContentReady] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible && thumbnailLayout) {
      progress.value = withSpring(1, { damping: 15, stiffness: 150 });
      const timer = setTimeout(() => setContentReady(true), 300);
      return () => clearTimeout(timer);
    } else if (visible && !thumbnailLayout) {
      setContentReady(true);
      progress.value = 1;
    } else {
      setContentReady(false);
      progress.value = 0;
    }
  }, [visible, thumbnailLayout]);

  const handleClose = () => {
    if (thumbnailLayout) {
      progress.value = withSpring(0, { damping: 15, stiffness: 150 });
      setTimeout(() => {
        onClose();
        setCurrentIndex(initialIndex);
      }, 250);
    } else {
      onClose();
    }
  };

  const placeholderStyle = useAnimatedStyle(() => {
    if (!thumbnailLayout) return { opacity: 0 };
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, width / thumbnailLayout.width],
      Extrapolate.CLAMP,
    );
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, (width - thumbnailLayout.width) / 2 - thumbnailLayout.x],
      Extrapolate.CLAMP,
    );
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, (height - thumbnailLayout.height) / 2 - thumbnailLayout.y],
      Extrapolate.CLAMP,
    );
    return {
      position: "absolute",
      top: thumbnailLayout.y,
      left: thumbnailLayout.x,
      width: thumbnailLayout.width,
      height: thumbnailLayout.height,
      transform: [{ scale }, { translateX }, { translateY }],
      opacity: progress.value,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-row justify-between items-center px-4 pt-2 z-10">
          <Pressable onPress={handleClose} hitSlop={20}>
            <X color="white" size={24} />
          </Pressable>
          <Text className="text-white text-base">
            {currentIndex + 1} / {images.length}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {contentReady && (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={images}
              keyExtractor={(_, index) => `image-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={initialIndex}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                });
              }}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width,
                );
                setCurrentIndex(newIndex);
              }}
              renderItem={({ item }) => (
                <View style={{ width, height: height - 100 }}>
                  <ZoomableImage
                    uri={item}
                    style={{ width, height: height - 100 }}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
          </GestureHandlerRootView>
        )}

        {thumbnailLayout && (
          <Animated.Image
            source={{ uri: images[initialIndex] }}
            style={[placeholderStyle, { zIndex: 20 }]}
            resizeMode="cover"
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default ImageGallery;
