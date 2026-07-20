import { useRefundPolicy } from "@/features/refundreturnpolicy/hooks";
import { PolicyDescription } from "@/features/refundreturnpolicy/types";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml, {
  defaultSystemFonts,
  MixedStyleRecord,
} from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const cleanHtml = (html: string): string =>
  html
    .replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, "")
    .replace(/<o:[^>]+>/gi, "")
    .replace(/\s*mso-[^;"}]+;?/gi, "")
    .replace(/\s*class="[^"]*Mso[^"]*"/gi, "")
    .replace(/\s*style="\s*"/gi, "")
    .replace(/text-indent:[^;"}]+;?/gi, "")
    .replace(/(<p[^>]*>\s*<\/p>\s*)+/gi, "")
    .trim();

const tagsStyles: MixedStyleRecord = {
  body: { fontSize: 13, lineHeight: 20, color: "#374151" },
  p: { marginTop: 0, marginBottom: 8 },
  b: { color: "#111827" },
  strong: { color: "#111827" },
  ul: { marginBottom: 8 },
  ol: { marginBottom: 8 },
  li: { marginBottom: 4 },
  table: { borderTopWidth: 1, borderColor: "#E5E7EB", marginBottom: 8 },
  th: {
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#F9FAFB",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    color: "#6B7280",
  },
  td: {
    fontSize: 12,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: "#F3F4F6",
    color: "#374151",
  },
};

const systemFonts = [...defaultSystemFonts];

type TabType = "return" | "refund";

const RefundReturnPolicy = () => {
  const { data, isLoading, isError } = useRefundPolicy();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabType>("return");

  const returnPolicy = data?.data?.find(
    (d: PolicyDescription) => d.type === "return",
  );
  const refundPolicy = data?.data?.find(
    (d: PolicyDescription) => d.type === "refund",
  );

  const activeHtml =
    activeTab === "return"
      ? (returnPolicy?.description ?? "")
      : (refundPolicy?.description ?? "");

  return (
    <View className="flex-1 bg-white">
      <View className=" p-4 flex-row justify-between items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={20} />
        </TouchableOpacity>
        <Text className="text-lg font-bold "> Return & Refund Policy</Text>
        <View />
      </View>

      <View className="bg-white flex-row border-b border-neutral-50">
        {(["return", "refund"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
            className="flex-1 py-3 items-center"
          >
            <Text
              className={`text-sm font-inter-semibold ${
                activeTab === tab ? "text-yellow-500" : "text-neutral-400"
              }`}
            >
              {tab === "return" ? "Returns" : "Refunds"}
            </Text>
            {activeTab === tab && (
              <View className="absolute bottom-0 h-0.5 w-16 bg-yellow-400 rounded-full" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FBBF24" />
          <Text className="mt-3 text-sm text-neutral-400">Loading policy…</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">😕</Text>
          <Text className="text-base font-inter-semibold text-neutral-700 text-center">
            Failed to load policy
          </Text>
          <Text className="text-sm text-neutral-400 text-center mt-1">
            Please check your connection and try again.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {activeHtml ? (
            <RenderHtml
              contentWidth={width - 32}
              source={{ html: cleanHtml(activeHtml) }}
              tagsStyles={tagsStyles}
              systemFonts={systemFonts}
              enableExperimentalBRCollapsing
              enableExperimentalGhostLinesPrevention
            />
          ) : (
            <Text className="text-sm text-neutral-400 text-center mt-8">
              No policy content available.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default RefundReturnPolicy;
