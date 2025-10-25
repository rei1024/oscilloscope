// https://en.wikipedia.org/wiki/Fairy_chess_piece#Leapers
// https://en.wikipedia.org/wiki/List_of_fairy_chess_pieces

import { MathExtra } from "../util/math";

export function getDirectionName(dx: number, dy: number): string | null {
  dx = Math.abs(dx);
  dy = Math.abs(dy);

  const gcd = MathExtra.gcd(dx, dy);

  dx /= gcd;
  dy /= gcd;

  const tempDx = dx;
  dx = Math.max(dx, dy);
  dy = Math.min(tempDx, dy);

  if (dx === 2 && dy === 1) return "Knightwise";
  if (dx === 3 && dy === 1) return "Camelwise";
  if (dx === 4 && dy === 1) return "Giraffewise";
  if (dx === 5 && dy === 1) return "Ibiswise";
  if (dx === 6 && dy === 1) return "Flamingowise";
  if (dx === 3 && dy === 2) return "Zebrawise";
  if (dx === 4 && dy === 3) return "Antelopewise";

  return null;
}
