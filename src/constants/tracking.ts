export const trackingKeys = {
  deliveryLocation: (orderId: string) =>
    ["GetdeliveryLocation", orderId] as const,
  deliveryDetails: (orderIds: string[]) =>
    ["DeliveryDetails", orderIds] as const,
  driverOrderList: (status: string) => ["DriverOrderList", status] as const,
};

export const TRACKING = {
  CUSTOMER_POLL_MS: 10_000,

  CUSTOMER_STALE_MS: 5_000,

  DRIVER_PUSH_INTERVAL_MS: 15_000,

  DRIVER_PUSH_DISTANCE_M: 20,

  ROUTE_REFRESH_DISTANCE_M: 120,

  GRACE_PERIOD_MS: 15_000,

  NOTIFICATION_INTERVAL_MS: 5 * 60 * 1_000,

  RETRY_COUNT: 2,
  retryDelay: (attempt: number) => Math.min(1_000 * 2 ** attempt, 10_000),
} as const;
