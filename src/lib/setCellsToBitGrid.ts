import { BitGrid } from "@ca-ts/algo/bit";
import { CACellList } from "@ca-ts/pattern";

export function setCellsToBitGrid(bitGrid: BitGrid, cells: CACellList) {
  const centerX =
    Math.floor(bitGrid.getWidth() / 2) -
    Math.floor((cells.boundingRect?.width ?? 0) / 2);
  const centerY =
    Math.floor(bitGrid.getHeight() / 2) -
    Math.floor((cells.boundingRect?.height ?? 0) / 2);
  for (const {
    position: { x, y },
  } of cells.getCells()) {
    bitGrid.set(x + centerX, y + centerY);
  }
}
