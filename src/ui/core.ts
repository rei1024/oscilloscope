export type MapType = "period" | "frequency" | "heat" | "signature";

/**
 * 表示用
 */
export function displayMapTypeLower(mapType: MapType) {
  return mapType;
}

/**
 * 表示用
 */
export function displayMapTypeTitle(mapType: MapType): string {
  return {
    period: "Period",
    frequency: "Frequency",
    heat: "Heat",
    signature: "Signature",
  }[mapType];
}

export type ColorType = "grayscale" | "hue";
