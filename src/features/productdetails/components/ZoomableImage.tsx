import React from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type Props = {
  uri: string;
  style?: object;
  resizeMode?: "contain" | "cover";
};

const ZoomableImage: React.FC<Props> = ({
  uri,
  style,
  resizeMode = "contain",
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (savedScale.value !== 1) {
        translateX.value += e.translationX;
        translateY.value += e.translationY;
      }
    })
    .onEnd(() => {
      const maxX = ((savedScale.value - 1) * width) / 2;
      const maxY = ((savedScale.value - 1) * height) / 2;
      if (translateX.value > maxX) translateX.value = withSpring(maxX);
      if (translateX.value < -maxX) translateX.value = withSpring(-maxX);
      if (translateY.value > maxY) translateY.value = withSpring(maxY);
      if (translateY.value < -maxY) translateY.value = withSpring(-maxY);
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.Image
        source={{ uri }}
        style={[style, animatedStyle]}
        resizeMode={resizeMode}
      />
    </GestureDetector>
  );
};

export default ZoomableImage;
