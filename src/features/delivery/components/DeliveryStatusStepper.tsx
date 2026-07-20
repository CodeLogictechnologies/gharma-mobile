import { CheckCircle, MapPin, Package, Truck } from "lucide-react-native";
import React, { memo } from "react";
import { Text, View } from "react-native";

type StepState = "completed" | "in-progress" | "pending";

interface Step {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  state: StepState;
}

const STATE_COLORS: Record<StepState, string> = {
  completed: "#16A34A",
  "in-progress": "#F97316",
  pending: "#9CA3AF",
};

interface DeliveryStatusStepperProps {
  driverAssigned: boolean;
  driverStarted: boolean;
}


const DeliveryStatusStepper = ({
  driverAssigned,
  driverStarted,
}: DeliveryStatusStepperProps) => {
  const steps: Step[] = [
    { key: "placed", label: "Placed", icon: CheckCircle, state: "completed" },
    { key: "packed", label: "Packed", icon: Package, state: "completed" },
    {
      key: "ontheway",
      label: "On the way",
      icon: Truck,
      state: driverStarted
        ? "in-progress"
        : driverAssigned
          ? "in-progress"
          : "pending",
    },
    { key: "delivered", label: "Delivered", icon: MapPin, state: "pending" },
  ];

  return (
    <View className="flex-row items-center px-1 pb-3">
      {steps.map((step, index) => {
        const color = STATE_COLORS[step.state];
        const Icon = step.icon;
        const isLast = index === steps.length - 1;
        const connectorDone = step.state === "completed";

        return (
          <React.Fragment key={step.key}>
            <View className="items-center" style={{ width: 64 }}>
              <View
                className="w-8 h-8 rounded-full items-center justify-center border"
                style={{
                  backgroundColor:
                    step.state === "completed"
                      ? "#DCFCE7"
                      : step.state === "in-progress"
                        ? "#FFEDD5"
                        : "#F3F4F6",
                  borderColor: color,
                }}
              >
                <Icon size={15} color={color} />
              </View>
              <Text
                className="text-[10px] font-medium mt-1 text-center"
                style={{
                  color: step.state === "pending" ? "#9CA3AF" : "#111827",
                }}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>
            {!isLast && (
              <View
                className="flex-1 h-0.5 -mt-4 rounded-full"
                style={{
                  backgroundColor: connectorDone ? "#16A34A" : "#E5E7EB",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default memo(DeliveryStatusStepper);
