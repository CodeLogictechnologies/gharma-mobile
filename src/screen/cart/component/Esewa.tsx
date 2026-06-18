import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
} from "react-native";
import EsewaIcon from "~/assets/images/icon/EsewaIcon";
import { useEsewaDeepLink } from "../hooks/useEsewaDeepLink";
import { bookPayment, checkPaymentStatus } from "../libs/esewa";

interface EsewaPaymentProps {
  amount: number;
  transactionUuid: string;
  customerId?: string;
  remarks?: string;
  onSuccess?: (data: { referenceCode: string; transactionId: string }) => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
}

const PRODUCT_CODE = "INTENT";
const CALLBACK_URL = "https://your-backend.com/api/esewa/callback";
const REDIRECT_URL = "gharma://payment/esewa"; // Use your actual scheme

export default function EsewaPayment({
  amount,
  transactionUuid,
  customerId,
  remarks,
  onSuccess,
  onFailure,
  onCancel,
}: EsewaPaymentProps) {
  const [loading, setLoading] = useState(false);
  const bookingRef = useRef<string | null>(null);
  const correlationRef = useRef<string | null>(null);

  // Handle return from eSewa app
  useEsewaDeepLink(
    useCallback(
      async (url: string) => {
        const bookingId = bookingRef.current;
        const correlationId = correlationRef.current;

        if (!bookingId || !correlationId) return;

        try {
          const status = await checkPaymentStatus({
            booking_id: bookingId,
            product_code: PRODUCT_CODE,
            correlation_id: correlationId,
          });

          if (status.data.status === "SUCCESS") {
            onSuccess?.({
              referenceCode: status.data.reference_code,
              transactionId: status.data.transaction_id,
            });
          } else if (status.data.status === "CANCELED") {
            onCancel?.();
          } else {
            onFailure?.(`Payment status: ${status.data.status}`);
          }
        } catch (error) {
          onFailure?.(
            error instanceof Error ? error.message : "Status check failed",
          );
        } finally {
          setLoading(false);
          bookingRef.current = null;
          correlationRef.current = null;
        }
      },
      [onSuccess, onFailure, onCancel],
    ),
  );

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await bookPayment({
        product_code: PRODUCT_CODE,
        amount,
        transaction_uuid: transactionUuid,
        callback_url: CALLBACK_URL,
        redirect_url: REDIRECT_URL,
        properties: {
          customer_id: customerId,
          remarks,
        },
      });

      if (response.code === "IP-201") {
        bookingRef.current = response.data.booking_id;
        correlationRef.current = response.data.correlation_id;

        const supported = await Linking.canOpenURL(response.data.deeplink);

        if (supported) {
          await Linking.openURL(response.data.deeplink);
        } else {
          Alert.alert(
            "eSewa Not Found",
            "Please install the eSewa app to complete this payment.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  setLoading(false);
                  bookingRef.current = null;
                  correlationRef.current = null;
                },
              },
              {
                text: "Install",
                onPress: () => {
                  Linking.openURL(
                    "https://play.google.com/store/apps/details?id=com.f1soft.esewa",
                  );
                  setLoading(false);
                  bookingRef.current = null;
                  correlationRef.current = null;
                },
              },
            ],
          );
        }
      } else {
        throw new Error(response.message || "Booking failed");
      }
    } catch (error) {
      setLoading(false);
      bookingRef.current = null;
      correlationRef.current = null;
      Alert.alert(
        "Payment Error",
        error instanceof Error ? error.message : "Failed to initiate payment",
      );
      onFailure?.(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePayment}
      disabled={loading}
      activeOpacity={0.8}
      className="flex-1 flex-row items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-3" // style={{ backgroundColor: "#60BB46" }}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <>
          <EsewaIcon />
          <Text className="text-x font-semibold text-gray-700">eSewa</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
