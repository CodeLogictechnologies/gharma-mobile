import { generateEsewaSignature } from "./esewaSignature";

const BASE_URL = "https://rc-checkout.esewa.com.np/api/client/intent";

export interface BookPaymentRequest {
  product_code: string;
  amount: number;
  transaction_uuid: string;
  callback_url: string;
  redirect_url: string;
  properties?: {
    customer_id?: string;
    remarks?: string;
    [key: string]: string | undefined;
  };
}

export interface BookPaymentResponse {
  code: string;
  data: {
    booking_id: string;
    deeplink: string;
    correlation_id: string;
  };
  message: string;
}

export interface StatusCheckRequest {
  booking_id: string;
  product_code: string;
  correlation_id: string;
}

export interface StatusCheckResponse {
  code: string;
  data: {
    booking_id: string;
    product_code: string;
    status:
      | "BOOKED"
      | "SUCCESS"
      | "PENDING"
      | "FAILED"
      | "CANCELED"
      | "REVERTED";
    correlation_id: string;
    transaction_id: string;
    reference_code: string;
    updated_at: string;
  };
  message: string;
}

export async function bookPayment(
  payload: BookPaymentRequest,
): Promise<BookPaymentResponse> {
  const signedFieldNames = "product_code,amount,transaction_uuid";

  const signature = generateEsewaSignature(
    {
      product_code: payload.product_code,
      amount: payload.amount,
      transaction_uuid: payload.transaction_uuid,
    },
    signedFieldNames,
  );

  const response = await fetch(`${BASE_URL}/payment/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      signed_field_names: signedFieldNames,
      signature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_message || "Failed to book payment");
  }

  return response.json();
}

export async function checkPaymentStatus(
  payload: StatusCheckRequest,
): Promise<StatusCheckResponse> {
  const signedFieldNames = "booking_id,product_code,correlation_id";

  const signature = generateEsewaSignature(
    {
      booking_id: payload.booking_id,
      product_code: payload.product_code,
      correlation_id: payload.correlation_id,
    },
    signedFieldNames,
  );

  const response = await fetch(`${BASE_URL}/payment/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      signed_field_names: signedFieldNames,
      signature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_message || "Failed to check status");
  }

  return response.json();
}

export async function cancelPayment(
  bookingId: string,
  productCode: string = "INTENT",
): Promise<{
  code: string;
  data: {
    booking_id: string;
    status: string;
    correlation_id: string;
    transaction_id: string;
  };
  message: string;
}> {
  const signedFieldNames = "booking_id,product_code";

  const signature = generateEsewaSignature(
    { booking_id: bookingId, product_code: productCode },
    signedFieldNames,
  );

  const response = await fetch(`${BASE_URL}/payment/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      booking_id: bookingId,
      product_code: productCode,
      signed_field_names: signedFieldNames,
      signature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_message || "Failed to cancel payment");
  }

  return response.json();
}
