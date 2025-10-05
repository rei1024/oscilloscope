export interface Rect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type Size = {
  width: number;
  height: number;
};

export function rectToSize({ minX, minY, maxX, maxY }: Rect): Size {
  return {
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export function rectToArea(rect: Rect): number {
  const { width, height } = rectToSize(rect);
  return width * height;
}
