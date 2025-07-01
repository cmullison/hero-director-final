import { oklch, rgb, formatHex } from "culori";

export function oklchToRgb(l: number, c: number, h: number): string {
  const rgbColor = rgb(oklch({ l: l / 100, c: c / 100, h }));
  return rgbColor
    ? `rgb(${Math.round(rgbColor.r * 255)}, ${Math.round(rgbColor.g * 255)}, ${Math.round(rgbColor.b * 255)})`
    : "rgb(0, 0, 0)";
}

export function oklchToHex(l: number, c: number, h: number): string {
  return formatHex(oklch({ l: l / 100, c: c / 100, h })) || "#000000";
}

export function getSpectrumColor(x: number, y: number, l: number): string {
  const c = x * 0.4; // Max chroma is 0.4 in OKLCH
  const h = y * 360;
  return oklchToRgb(l, c * 100, h);
}

export function isValidOklch(l: number, c: number, h: number): boolean {
  const rgbColor = rgb(oklch({ l: l / 100, c: c / 100, h }));
  return (
    rgbColor !== null &&
    rgbColor.r >= 0 &&
    rgbColor.r <= 1 &&
    rgbColor.g >= 0 &&
    rgbColor.g <= 1 &&
    rgbColor.b >= 0 &&
    rgbColor.b <= 1
  );
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

export function generateColorPalette(
  l: number,
  c: number,
  h: number,
  count: number,
  tintStrength: number
): string[] {
  const baseColor = oklch({ l: l / 100, c: c / 100, h });
  const palette = [];

  const step = 1 / (count - 1);
  for (let i = 0; i < count; i++) {
    const factor = i * step;
    const newL = Math.max(0, Math.min(1, baseColor.l + factor * tintStrength));
    const newC = Math.max(
      0,
      Math.min(0.4, baseColor.c * (1 - factor * tintStrength))
    );
    const shade = oklch({ l: newL, c: newC, h: baseColor.h });
    palette.push(formatHex(shade) || "#000000");
  }

  return palette;
}

export function createSvgPalette(colors: string[]): string {
  const svgWidth = 200;
  const svgHeight = 50;
  const rectWidth = svgWidth / colors.length;

  const rects = colors
    .map(
      (color, index) =>
        `<rect x="${index * rectWidth}" y="0" width="${rectWidth}" height="${svgHeight}" fill="${color}" />`
    )
    .join("");

  return `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}
