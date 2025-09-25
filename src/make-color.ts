function heatColor(index: number, len: number): string {
  // make red
  const value = (index + 1) / len;
  // Heat map
  const h = (1 - value) * 240;
  return "hsl(" + h + " 100% 70%)";
}

function grayColor(index: number, len: number): string {
  const value = (index + 1) / len;
  const lightness = 100 * (3 / 4 - value / 2);
  return `hsl(0 0% ${lightness}%)`;
}

function hueForPeriodColor(
  index: number,
  len: number,
  hasStableCell: boolean,
): string {
  if (hasStableCell && index === len - 1) {
    // stable cell is gray
    return "hsl(0 0% 90%)";
  } else if (index === 0) {
    // last cell is lighter gray
    return "hsl(0 0% 70%)";
  }

  const value = index / len;
  const hue = value * 360;
  return `lch(70% 70 ${hue})`;
}

export function makeColorMap({
  list,
  style,
}: {
  list: number[];
  style: "gray" | "hue-for-period" | "heat";
}): Map<number, string> {
  const len = list.length;
  const hasStableCell = list.some((x) => x === 1);
  return new Map(
    list.map((x, index) => {
      let color: string;
      switch (style) {
        case "gray": {
          color = grayColor(index, len);
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
