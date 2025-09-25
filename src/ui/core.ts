export type MapType = "period" | "frequency" | "heat";

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
  }[mapType];
}
