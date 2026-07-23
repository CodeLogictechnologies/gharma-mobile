export function shadeHexColor(hex: string, percent: number) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;

  const f = parseInt(clean, 16);
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? -percent : percent;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;

  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}
