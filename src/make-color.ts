/**
 * blue to red gradation
 */
function heatColor(index: number, len: number): string {
  // make red
  const value = (index + 1) / len;
  // Heat map
  const h = (1 - value) * 240;
  return "hsl(" + h + " 100% 70%)";
}

function hueForFrequencyColor(
  index: number,
  len: number,
  hasStatorCell: boolean,
): string {
  if (hasStatorCell && index === len - 1) {
    // for stator cell
    return "hsl(0 0% 65%)";
  }

  const correctedLen = len - (hasStatorCell ? 1 : 0);

  const value = index / correctedLen;
  const hue = (1 - value + 0.2) * 330;
  return `lch(70% 70 ${hue})`;
}

function grayColor(index: number, len: number): string {
  const value = (index + 1) / len;
  const lightness = 100 * (3 / 4 - value / 2);
  return `hsl(0 0% ${lightness}%)`;
}

function grayReverseColor(index: number, len: number): string {
  return grayColor(len - 1 - index, len);
}

function hueForPeriodColor(
  index: number,
  len: number,
  hasStatorCell: boolean,
  hasFullPeriodCell: boolean,
): string {
  if (hasStatorCell && index === 0) {
    // for stable cell
    return "hsl(0 0% 65%)";
  } else if (hasFullPeriodCell && index === len - 1) {
    // full period cells
    return "hsl(0 0% 90%)";
  }

  const correctedLen =
    len - ((hasStatorCell ? 1 : 0) + (hasFullPeriodCell ? 1 : 0));

  const value = index / correctedLen;
  return `lch(70% 70 ${value * 360})`;
}

export function makeColorMap({
  list,
  style,
  hasStatorCell,
  hasFullPeriodCell,
}: {
  list: number[];
  style:
    | "gray"
    | "gray-reverse"
    | "hue-for-frequency"
    | "hue-for-period"
    | "heat";
  hasStatorCell: boolean;
  hasFullPeriodCell: boolean;
}): Map<number, string> {
  const len = list.length;
  return new Map(
    list.map((x, index) => {
      let color: string;
      switch (style) {
        case "gray": {
          color = grayColor(index, len);
          break;
        }
        case "gray-reverse": {
          color = grayReverseColor(index, len);
          break;
        }
        case "hue-for-frequency": {
          color = hueForFrequencyColor(index, len, hasStatorCell);
          break;
        }
        case "hue-for-period": {
          color = hueForPeriodColor(
            index,
            len,
            hasStatorCell,
            hasFullPeriodCell,
          );
          break;
        }
        case "heat": {
          color = heatColor(index, len);
          break;
        }
      }

      return [x, color];
    }),
  );
}
