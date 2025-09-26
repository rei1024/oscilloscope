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
  hasStableCell: boolean,
): string {
  if (hasStableCell && index === len - 1) {
    // for stable cell
    return "hsl(0 0% 65%)";
  }

  const correctedLen = hasStableCell ? len - 1 : len;

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
  hasStableCell: boolean,
): string {
  if (hasStableCell && index === 0) {
    // for stable cell
    return "hsl(0 0% 65%)";
  } else if (index === len - 1) {
    // full period cells
    return "hsl(0 0% 90%)";
  }

  const correctedLen = hasStableCell ? len - 2 : len - 1;

  const value = index / correctedLen;
  return `lch(70% 70 ${value * 360})`;
}

export function makeColorMap({
  list,
  style,
  hasStableCell,
}: {
  list: number[];
  style:
    | "gray"
    | "gray-reverse"
    | "hue-for-frequency"
    | "hue-for-period"
    | "heat";
  hasStableCell: boolean;
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
          color = hueForFrequencyColor(index, len, hasStableCell);
          break;
        }
        case "hue-for-period": {
          color = hueForPeriodColor(index, len, hasStableCell);
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
