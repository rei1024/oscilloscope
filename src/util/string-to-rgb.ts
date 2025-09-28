let cachedContext = new Map<PredefinedColorSpace, CanvasRenderingContext2D>();

export function stringToRGB(
  string: string,
  colorSpace: PredefinedColorSpace = "srgb",
): [r: number, g: number, b: number] {
  if (!cachedContext.has(colorSpace)) {
    // 1x1ピクセルのオフスクリーンCanvasを作成
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    // 2Dコンテキストを取得
    // { willReadFrequently: true }はパフォーマンス向上のため推奨されます
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
      colorSpace,
    });

    if (ctx == null) {
      throw Error("Context");
    }
    cachedContext.set(colorSpace, ctx);
  }

  const ctx = cachedContext.get(colorSpace);
  if (ctx == null) {
    throw Error("Context");
  }

  // LCH文字列をfillStyleに設定
  // ブラウザがこれをsRGB(またはdisplay-p3など)に変換します
  ctx.fillStyle = string;

  // 1x1の領域を塗りつぶし
  ctx.fillRect(0, 0, 1, 1);

  // ピクセルデータを取得
  // data配列には[R, G, B, A]の順で0-255の値が入っています
  const data = ctx.getImageData(0, 0, 1, 1).data;

  // RGB値を返す (透明度は除外)
  // 例: [113, 91, 255]
  return [data[0], data[1], data[2]];
}
