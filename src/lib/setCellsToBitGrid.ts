import { BitGrid } from "@ca-ts/algo/bit";

export function boundingBox(cells: { x: number; y: number }[]) {
  const maxX = cells.reduce((acc, cell) => Math.max(acc, cell.x), 0);
  const maxY = cells.reduce((acc, cell) => Math.max(acc, cell.y), 0);
  const minX = cells.reduce((acc, cell) => Math.min(acc, cell.x), 0);
  const minY = cells.reduce((acc, cell) => Math.min(acc, cell.y), 0);
  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  return {
    maxX,
    maxY,
    minX,
    minY,
    sizeX,
    sizeY,
  };
}

export function setCellsToBitGrid(
  bitGrid: BitGrid,
  cells: { x: number; y: number }[],
  { sizeX, sizeY }: { sizeX: number; sizeY: number },
) {
  const centerX = Math.floor(bitGrid.getWidth() / 2) - Math.floor(sizeX / 2);
  const centerY = Math.floor(bitGrid.getHeight() / 2) - Math.floor(sizeY / 2);
  for (const { x, y } of cells) {
    bitGrid.set(x + centerX, y + centerY);
  }
}
