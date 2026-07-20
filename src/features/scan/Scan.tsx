import { useProductByBarcode } from "@/features/scan/hooks";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { ArrowLeft, CameraOff } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const FRAME_SIZE = Math.min(width, height) * 0.6;

const Scan = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState("");
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const {
    data: barcodeData,
    isLoading: isFetchingProduct,
    isError,
  } = useProductByBarcode(scannedCode);

  useEffect(() => {
    if (barcodeData?.result?.productid && !hasNavigated) {
      setHasNavigated(true);
      router.push({
        pathname: "/(app)/productdetails",
        params: {
          id: barcodeData.result.productid,
          title: barcodeData.result.title,
          imageUri: barcodeData.result.images?.[0] ?? "",
        },
      });
    }
  }, [barcodeData, hasNavigated, router]);

  useEffect(() => {
    if (isError && scannedCode) {
      Alert.alert(
        "Product Not Found",
        "Something went wrong. Please try again.",
        [
          {
            text: "Scan Again",
            onPress: () => {
              setScannedCode("");
              setHasNavigated(false);
            },
          },
        ],
      );
    }
  }, [isError, scannedCode]);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (!data || hasNavigated || isFetchingProduct) return;
      if (data === scannedCode) return;
      setScannedCode(data);
    },
    [scannedCode, hasNavigated, isFetchingProduct],
  );

  const handleScanAgain = () => {
    setScannedCode("");
    setHasNavigated(false);
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-secondary">
        <ActivityIndicator size="large" color="#d7a11b" />
        <Text className="text-sm text-gray mt-4 font-inter-regular">
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-secondary px-8">
        <View className="w-20 h-20 rounded-full bg-yellow/15 justify-center items-center mb-6">
          <CameraOff size={36} color="#d7a11b" />
        </View>
        <Text className="text-xl font-inter-bold text-gray-900 mb-2">
          Camera Access Required
        </Text>
        <Text className="text-sm text-gray text-center mb-8 leading-5">
          We need camera access to scan product barcodes. Please grant
          permission to continue.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-yellow px-8 py-3 rounded-md w-full items-center"
        >
          <Text className="text-white text-base font-inter-semibold">
            Grant Permission
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-2"
        >
          <Text className="text-gray text-sm font-inter-regular">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scannedCode ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "code128",
            "code39",
            "upc_a",
            "upc_e",
          ],
        }}
      />

      {/* Interactive overlay: header + bottom controls */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            onPress={() => router.navigate("/(app)/(tabs)/(home)")}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-inter-semibold">
            Scan Product
          </Text>
          <View style={styles.backButton} />
        </SafeAreaView>

        <SafeAreaView style={styles.bottom}>
          {isFetchingProduct ? (
            <View className="items-center gap-2">
              <Text className="text-white text-base font-inter-semibold">
                Looking up product...
              </Text>
              <Text className="text-white/60 text-sm font-inter-regular">
                {scannedCode}
              </Text>
            </View>
          ) : scannedCode ? (
            <View className="items-center gap-3">
              <Text className="text-white/80 text-sm font-inter-regular">
                Scanned: {scannedCode}
              </Text>
              <TouchableOpacity
                onPress={handleScanAgain}
                style={styles.scanAgainButton}
              >
                <Text className="text-white text-sm font-inter-semibold">
                  Scan Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center gap-2">
              <Text className="text-white/70 text-sm font-inter-regular">
                Point camera at a barcode
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* Non-interactive visual overlay: frame corners + scan line */}
      <View style={styles.visualOverlay} pointerEvents="none">
        <View style={styles.frameContainer}>
          <View
            style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE }]}
          >
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {!scannedCode && !isFetchingProduct && (
              <View style={styles.scanLine} />
            )}

            {isFetchingProduct && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#d7a11b" />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  visualOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#d7a11b",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: "#d7a11b",
    top: "15%",
    shadowColor: "#d7a11b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  scanAgainButton: {
    backgroundColor: "#d7a11b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
});

export default Scan;
