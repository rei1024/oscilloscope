import { BitGrid } from "@ca-ts/algo/bit";
import { CACellList } from "@ca-ts/pattern";

export function setCellsToBitGrid(bitGrid: BitGrid, cells: CACellList) {
  const rect = cells.boundingRect;
  if (!rect) {
    return;
  }
  const centerX =
    Math.floor(bitGrid.getWidth() / 2) - Math.floor(rect.width / 2);
  const centerY =
    Math.floor(bitGrid.getHeight() / 2) - Math.floor(rect.height / 2);
  for (const {
    position: { x, y },
  } of cells.getCells()) {
    bitGrid.set(x + centerX - rect.minX, y + centerY - rect.minY);
  }
}
