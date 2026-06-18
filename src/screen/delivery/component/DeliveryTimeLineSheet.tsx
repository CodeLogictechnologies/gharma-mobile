import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Truck,
} from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "completed" | "in-progress" | "pending";
}

interface DeliveryTimelineSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  orderId: string;
  driverAssigned?: boolean;
  driverStarted?: boolean;
}

// Static timeline data - replace with API when ready
const getStaticTimeline = (
  driverAssigned: boolean,
  driverStarted: boolean,
): TimelineEvent[] => {
  const baseTimeline: TimelineEvent[] = [
    {
      id: "1",
      title: "Order Placed",
      description: "Your order has been confirmed",
      time: "10:30 AM",
      status: "completed",
    },
    {
      id: "2",
      title: "Order Packed",
      description: "Your items have been packed and are ready",
      time: "11:00 AM",
      status: "completed",
    },
    {
      id: "3",
      title: "Out for Delivery",
      description: "Your order is on the way to you",
      time: "11:30 AM",
      status: driverStarted
        ? "completed"
        : driverAssigned
          ? "in-progress"
          : "pending",
    },
    {
      id: "4",
      title: "Near Delivery",
      description: "Driver is approaching your location",
      time: "--",
      status: "pending",
    },
    {
      id: "5",
      title: "Delivered",
      description: "Order delivered successfully",
      time: "--",
      status: "pending",
    },
  ];

  return baseTimeline;
};

const getStatusIcon = (status: TimelineEvent["status"], index: number) => {
  const iconProps = { size: 18, strokeWidth: 2 };

  if (status === "completed") {
    return <CheckCircle size={20} color="#16A34A" fill="#16A34A" />;
  }
  if (status === "in-progress") {
    return <Truck size={20} color="#F97316" />;
  }

  // pending icons based on step
  const pendingIcons = [
    <Clock color="#9CA3AF" {...iconProps} />,
    <Package color="#9CA3AF" {...iconProps} />,
    <Truck color="#9CA3AF" {...iconProps} />,
    <MapPin color="#9CA3AF" {...iconProps} />,
    <CheckCircle color="#9CA3AF" {...iconProps} />,
  ];
  return pendingIcons[index] || pendingIcons[0];
};

const getStatusColor = (status: TimelineEvent["status"]) => {
  switch (status) {
    case "completed":
      return "#16A34A";
    case "in-progress":
      return "#F97316";
    default:
      return "#9CA3AF";
  }
};

const DeliveryTimelineSheet: React.FC<DeliveryTimelineSheetProps> = ({
  sheetRef,
  orderId,
  driverAssigned = false,
  driverStarted = false,
}) => {
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const timeline = useMemo(
    () => getStaticTimeline(driverAssigned, driverStarted),
    [driverAssigned, driverStarted],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Order Timeline</Text>
          <Text style={styles.headerSubtitle}>Order #{orderId.slice(-8)}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {timeline.map((event, index) => {
            const isLast = index === timeline.length - 1;
            const statusColor = getStatusColor(event.status);

            return (
              <View key={event.id} style={styles.timelineRow}>
                {/* Left: Icon & Connector */}
                <View style={styles.iconColumn}>
                  <View
                    style={[
                      styles.iconWrapper,
                      {
                        backgroundColor:
                          event.status === "completed"
                            ? "#DCFCE7"
                            : event.status === "in-progress"
                              ? "#FFEDD5"
                              : "#F3F4F6",
                        borderColor: statusColor,
                      },
                    ]}
                  >
                    {getStatusIcon(event.status, index)}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.connector,
                        {
                          backgroundColor:
                            event.status === "completed"
                              ? "#16A34A"
                              : "#E5E7EB",
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Right: Content */}
                <View style={styles.contentColumn}>
                  <View style={styles.contentRow}>
                    <View style={styles.textWrapper}>
                      <Text
                        style={[
                          styles.eventTitle,
                          {
                            color:
                              event.status === "pending"
                                ? "#9CA3AF"
                                : "#111827",
                          },
                        ]}
                      >
                        {event.title}
                      </Text>
                      <Text style={styles.eventDescription}>
                        {event.description}
                      </Text>
                    </View>
                    <Text style={[styles.eventTime, { color: statusColor }]}>
                      {event.time}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Info Banner */}
        {!driverStarted && (
          <View style={styles.infoBanner}>
            <Clock size={16} color="#3B82F6" />
            <Text style={styles.infoText}>
              {driverAssigned
                ? "Driver has been assigned. Waiting to start delivery..."
                : "Looking for a nearby driver for your order..."}
            </Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: "#D1D5DB",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  timelineContainer: {
    flex: 1,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 70,
  },
  iconColumn: {
    alignItems: "center",
    width: 40,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  connector: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 6,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  eventDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 18,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#3B82F6",
    lineHeight: 18,
  },
});

export default DeliveryTimelineSheet;
