import { ProductItem } from "@/types/product";


export interface PriceRange {
  low: number;
  high: number;
  minQty: number;
}


export function isWholesalerItem(item: ProductItem): boolean {
  return (item.wholesaler_price?.length ?? 0) > 0;
}


export function getPriceRange(item: ProductItem): PriceRange {
  if (isWholesalerItem(item)) {
    const tiers = item.wholesaler_price!;
    const prices = tiers.map((t) => parseFloat(t.price));
    return {
      low: Math.min(...prices),
      high: Math.max(...prices),
      minQty: tiers[0].min_qty,
    };
  }

  const price = parseFloat(item.price ?? "0");
  return { low: price, high: price, minQty: 1 };
}


export function resolvePrice(item: ProductItem, qty: number): number {
  if (isWholesalerItem(item)) {
    const tiers = item.wholesaler_price!;
    const band = tiers.find((t) => qty >= t.min_qty && qty <= t.max_qty);
    if (band) return parseFloat(band.price);
    return parseFloat(tiers[tiers.length - 1].price);
  }

  return parseFloat(item.price ?? "0");
}
