import { router } from "expo-router";
import { CheckCircle2, Download, FileText, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import Pdf from "react-native-pdf";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
  ZoomIn,
} from "react-native-reanimated";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const { height, width } = Dimensions.get("window");

interface OrderSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  orderData?: {
    type: string;
    message: string;
    invoice: {
      ordermasterid: string;
      invoicenumber: string;
      storagepath: string;
      storage_url: string;
    };
  };
}

const OrderSuccessModal = ({
  visible,
  onClose,
  orderData,
}: OrderSuccessModalProps) => {
  const invoice = orderData?.invoice;
  const [downloading, setDownloading] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const orderId = invoice?.invoicenumber || "";
  const invoiceUrl = invoice?.storage_url || "";

  const getDownloadUrl = useCallback(() => {
    return invoiceUrl.replace(/^http:\/\//, "https://");
  }, [invoiceUrl]);

  const handleDownloadInvoice = useCallback(async () => {
    if (!invoiceUrl) {
      Alert.alert("Invoice Not Available", "The invoice URL is not available.");
      return;
    }

    setDownloading(true);

    try {
      const downloadUrl = getDownloadUrl();
      const fileName = `invoice-${orderId}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        fileUri,
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Server returned status ${downloadResult.status}`);
      }

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("Downloaded file not found on device");
      }
      if (fileInfo.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      let shared = false;
      try {
        if (Sharing && typeof Sharing.isAvailableAsync === "function") {
          const isSharingAvailable = await Sharing.isAvailableAsync();
          if (isSharingAvailable && typeof Sharing.shareAsync === "function") {
            await Sharing.shareAsync(fileUri, {
              mimeType: "application/pdf",
              dialogTitle: `Invoice ${orderId}`,
            });
            shared = true;
          }
        } else if (Sharing && typeof Sharing.shareAsync === "function") {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: `Invoice ${orderId}`,
          });
          shared = true;
        }
      } catch (shareError: any) {
        console.log("Sharing failed:", shareError?.message);
      }

      Alert.alert(
        "Download Complete",
        shared ? `Invoice saved and shared.` : `Invoice saved to device.`,
      );
    } catch (error: any) {
      Alert.alert(
        "Download Failed",
        error?.message || "Failed to download invoice. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  }, [invoiceUrl, orderId, getDownloadUrl]);

  const handleViewInvoice = useCallback(() => {
    if (!invoiceUrl) {
      Alert.alert("Invoice Not Available", "The invoice URL is not available.");
      return;
    }
    setShowPdfViewer(true);
  }, [invoiceUrl]);

  const handleContinueShopping = useCallback(() => {
    onClose();
    router.replace("/(app)/(tabs)/(home)");
  }, [onClose]);

  const pdfSource = { uri: getDownloadUrl(), cache: true };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

      <View style={styles.overlay}>
        <Animated.View
          entering={SlideInUp.duration(400).springify()}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="#6B7280" />
          </TouchableOpacity>

          <Animated.View
            entering={ZoomIn.delay(200).duration(500)}
            className="items-center mt-8 mb-6"
          >
            <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center">
              <CheckCircle2 size={48} color="#16A34A" strokeWidth={2} />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            className="items-center px-8"
          >
            <Text className="text-xl font-inter-bold text-gray-900 text-center">
              Thank You for Your Order!
            </Text>

            <Text className="text-sm text-gray-500 text-center mt-3 leading-5">
              Your payment was successful. A confirmation email has been sent to
              your email.
            </Text>

            <Text className="text-base font-inter-semibold text-gray-900 text-center mt-5">
              Order ID: #{orderId}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(500).duration(500)}
            className="px-6 mt-6 gap-3"
          >
            <TouchableOpacity
              onPress={handleViewInvoice}
              disabled={!invoiceUrl}
              className={`flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed ${
                !invoiceUrl
                  ? "border-gray-300 bg-gray-50"
                  : "border-primary bg-primary/5"
              }`}
            >
              <FileText size={18} color="#d7a11b" />
              <Text
                className={`text-sm font-inter-semibold ${
                  !invoiceUrl ? "text-gray-400" : "text-primary"
                }`}
              >
                View Invoice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownloadInvoice}
              disabled={downloading || !invoiceUrl}
              className={`flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed ${
                downloading || !invoiceUrl
                  ? "border-gray-300 bg-gray-50"
                  : "border-primary bg-primary/5"
              }`}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#d7a11b" />
              ) : (
                <Download size={18} color="#d7a11b" />
              )}
              <Text
                className={`text-sm font-inter-semibold ${
                  downloading || !invoiceUrl ? "text-gray-400" : "text-primary"
                }`}
              >
                {downloading ? "Downloading..." : "Download Invoice"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View className="flex-1" />

          <View className="px-6 pb-6 pt-4">
            <TouchableOpacity
              onPress={handleContinueShopping}
              className="bg-primary py-3.5 rounded-xl items-center"
            >
              <Text className="text-white font-inter-bold text-base">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={showPdfViewer}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowPdfViewer(false)}
      >
        <View style={styles.pdfContainer}>
          <View style={styles.pdfHeader}>
            <TouchableOpacity
              onPress={() => setShowPdfViewer(false)}
              style={styles.pdfCloseButton}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.pdfHeaderTitle}>Invoice #{orderId}</Text>
            <TouchableOpacity
              onPress={handleDownloadInvoice}
              disabled={downloading}
              style={styles.pdfDownloadButton}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Download size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* <Pdf
            source={pdfSource}
            style={styles.pdf}
            onLoadComplete={(numberOfPages: number) => {
              console.log(`PDF loaded. Pages: ${numberOfPages}`);
            }}
            onPageChanged={(page: number, numberOfPages: number) => {
              console.log(`Current page: ${page}/${numberOfPages}`);
            }}
            onError={(error: any) => {
              console.log("PDF Error:", error);
              Alert.alert("Error", "Failed to load PDF.");
              setShowPdfViewer(false);
            }}
            onPressLink={(uri: string) => {
              console.log(`Link pressed: ${uri}`);
            }}
          /> */}
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.7,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  pdfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
    paddingTop: 50,
  },
  pdfHeaderTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  pdfCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfDownloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  },
});

export default OrderSuccessModal;
