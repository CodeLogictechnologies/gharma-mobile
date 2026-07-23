import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
} from "react-native";
import EsewaIcon from "~/assets/images/icon/EsewaIcon";
import { useEsewaDeepLink } from "../hooks/useEsewaDeepLink";
import {
  useEsewaInitiate,
  useEsewaStatus,
  usePollEsewaStatus,
} from "../hooks/useEsewaPayment";
import { EsewaStatusResponse } from "../types";

interface EsewaPaymentProps {
  amount: number;
  customerId?: string;
  remarks?: string;
  onSuccess?: (data: { referenceCode: string; transactionId: string }) => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
  selectOnly?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface EsewaPaymentHandle {
  initiate: () => void;
  isLoading: boolean;
}

interface ActiveBooking {
  bookingId: string;
  correlationId: string;
}

const PAYMENT_TIMEOUT_MS = 5 * 60 * 1000;
const FINAL_STATUSES = ["SUCCESS", "FAILED", "CANCELED", "REVERTED"];

const isFinal = (status?: string) =>
  !!status && FINAL_STATUSES.includes(status);

const EsewaPayment = forwardRef<EsewaPaymentHandle, EsewaPaymentProps>(
  (
    {
      amount,
      customerId,
      remarks,
      onSuccess,
      onFailure,
      onCancel,
      selectOnly = false,
      isSelected = false,
      onSelect,
    },
    ref,
  ) => {
    const [booking, setBookingState] = useState<ActiveBooking | null>(null);
    const bookingRef = useRef<ActiveBooking | null>(null);
    const setBooking = useCallback((b: ActiveBooking | null) => {
      bookingRef.current = b;
      setBookingState(b);
    }, []);

    const initiateMutation = useEsewaInitiate();
    const statusMutation = useEsewaStatus();

    const loading =
      initiateMutation.isPending || statusMutation.isPending || !!booking;

    const { data: pollData } = usePollEsewaStatus(
      booking?.bookingId ?? null,
      booking?.correlationId ?? null,
      { enabled: !!booking },
    );

    const resolvePayment = useCallback(
      (status: EsewaStatusResponse) => {
        if (!bookingRef.current) return;
        setBooking(null);

        if (status.status === "SUCCESS") {
          onSuccess?.({
            referenceCode: status.reference_code || "",
            transactionId: status.transaction_id || "",
          });
        } else if (status.status === "CANCELED") {
          onCancel?.();
        } else {
          onFailure?.(
            status.message || `Payment ${status.status.toLowerCase()}`,
          );
        }
      },
      [onSuccess, onCancel, onFailure, setBooking],
    );

    useEffect(() => {
      if (pollData && isFinal(pollData.status)) {
        resolvePayment(pollData);
      }
    }, [pollData, resolvePayment]);

    useEffect(() => {
      if (!booking) return;
      const timer = setTimeout(() => {
        if (!bookingRef.current) return;
        setBooking(null);
        onFailure?.(
          "Payment verification timed out. If your account was charged, the order will be confirmed shortly.",
        );
      }, PAYMENT_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }, [booking, onFailure, setBooking]);

    const verifyStatus = useCallback(async () => {
      const active = bookingRef.current;
      if (!active) return;
      try {
        const status = await statusMutation.mutateAsync({
          booking_id: active.bookingId,
          correlation_id: active.correlationId,
        });
        if (isFinal(status.status)) {
          resolvePayment(status);
        }
      } catch {}
    }, [statusMutation, resolvePayment]);

    useEsewaDeepLink(
      useCallback(() => {
        verifyStatus();
      }, [verifyStatus]),
    );

    const handlePayment = useCallback(async () => {
      try {
        const response = await initiateMutation.mutateAsync({
          amount,
          customer_id: customerId,
          remarks,
        });

        if (!response.success) {
          throw new Error(response.message || "Payment initiation failed");
        }

        setBooking({
          bookingId: response.booking_id,
          correlationId: response.correlation_id,
        });

        await Linking.openURL(response.deeplink);
      } catch (error) {
        setBooking(null);
        const message =
          error instanceof Error ? error.message : "Failed to initiate payment";
        Alert.alert("Payment Error", message);
        onFailure?.(message);
      }
    }, [amount, customerId, remarks, initiateMutation, onFailure, setBooking]);

    useImperativeHandle(
      ref,
      () => ({
        initiate: handlePayment,
        isLoading: loading,
      }),
      [handlePayment, loading],
    );

    const handlePress = () => {
      if (selectOnly) {
        onSelect?.();
        return;
      }
      handlePayment();
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.8}
        className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3 border ${
          selectOnly && isSelected
            ? "border-primary bg-primary-tint"
            : "border-gray-200"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#60BB46" size="small" />
        ) : (
          <>
            <EsewaIcon />
            <Text
              className={`text-x font-semibold ${
                selectOnly && isSelected ? "text-primary-dark" : "text-gray-700"
              }`}
            >
              eSewa
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  },
);

EsewaPayment.displayName = "EsewaPayment";

export default EsewaPayment;
