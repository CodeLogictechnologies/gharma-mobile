import SkeletonProductCard from "@/components/common/skeleton/ProductCarouselSkeleton";
import { Skeleton } from "heroui-native";
import React from "react";
import { Dimensions, ScrollView, View } from "react-native";

const { width } = Dimensions.get("window");

const ProductDetailsSkeleton = () => (
  <ScrollView
    style={{ flex: 1, backgroundColor: "#fff" }}
    showsVerticalScrollIndicator={false}
  >
    <Skeleton
      style={{ width, height: width, marginBottom: 16 }}
      variant="shimmer"
      animation={{ shimmer: { duration: 2000, speed: 1.5 } }}
    />

    <View style={{ paddingHorizontal: 16 }}>
      <Skeleton
        style={{ width: "80%", height: 24, borderRadius: 6, marginBottom: 8 }}
      />
      <Skeleton
        style={{ width: "60%", height: 24, borderRadius: 6, marginBottom: 12 }}
      />

      <Skeleton
        style={{ width: "100%", height: 14, borderRadius: 4, marginBottom: 6 }}
      />
      <Skeleton
        style={{ width: "90%", height: 14, borderRadius: 4, marginBottom: 6 }}
      />
      <Skeleton
        style={{ width: "70%", height: 14, borderRadius: 4, marginBottom: 16 }}
      />

      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <Skeleton
          style={{ width: 130, height: 64, borderRadius: 8, marginRight: 12 }}
        />
        <Skeleton
          style={{ width: 130, height: 64, borderRadius: 8, marginRight: 12 }}
        />
        <Skeleton style={{ width: 130, height: 64, borderRadius: 8 }} />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Skeleton
          style={{ width: 150, height: 18, borderRadius: 4, marginBottom: 8 }}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <SkeletonProductCard />
          <SkeletonProductCard />
          <SkeletonProductCard />
        </View>
      </View>

      {/* Section title */}
      <Skeleton
        style={{
          width: 180,
          height: 18,
          borderRadius: 4,
          alignSelf: "center",
          marginBottom: 16,
        }}
      />

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <SkeletonProductCard />
        <SkeletonProductCard />
        <SkeletonProductCard />
        <SkeletonProductCard />
      </View>

      <Skeleton
        style={{
          width: "100%",
          height: 112,
          borderRadius: 8,
          marginBottom: 16,
        }}
      />
      <Skeleton
        style={{
          width: "100%",
          height: 112,
          borderRadius: 8,
          marginBottom: 16,
        }}
      />
    </View>
  </ScrollView>
);

export default ProductDetailsSkeleton;
