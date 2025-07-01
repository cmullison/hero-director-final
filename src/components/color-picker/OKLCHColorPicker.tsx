import React, { useState, useEffect } from "react";
import { ColorSpectrum } from "./ColorSpectrum";
import {
  oklchToRgb,
  oklchToHex,
  isValidOklch,
  copyToClipboard,
  generateColorPalette,
  createSvgPalette,
} from "../../lib/colorConversions";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function OKLCHColorPicker() {
  const [lightness, setLightness] = useState(50);
  const [chroma, setChroma] = useState(20);
  const [hue, setHue] = useState(180);
  const [rgbColor, setRgbColor] = useState("");
  const [hexColor, setHexColor] = useState("");
  const [oklchColor, setOklchColor] = useState("");
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [paletteCount, setPaletteCount] = useState(5);
  const [tintStrength, setTintStrength] = useState(0.5);

  useEffect(() => {
    if (isValidOklch(lightness, chroma, hue)) {
      const rgb = oklchToRgb(lightness, chroma, hue);
      const hex = oklchToHex(lightness, chroma, hue);
      const oklch = `oklch(${(lightness / 100).toFixed(3)} ${(chroma / 100).toFixed(3)} ${hue.toFixed(1)})`;
      setRgbColor(rgb);
      setHexColor(hex);
      setOklchColor(oklch);
      setColorPalette(
        generateColorPalette(lightness, chroma, hue, paletteCount, tintStrength)
      );
    } else {
      setRgbColor("Invalid Color");
      setHexColor("Invalid Color");
      setOklchColor("Invalid Color");
      setColorPalette([]);
    }
  }, [lightness, chroma, hue, paletteCount, tintStrength]);

  const handleSpectrumChange = (newChroma: number, newHue: number) => {
    setChroma(newChroma);
    setHue(newHue);
  };

  const handleCopy = async (text: string, type: string) => {
    await copyToClipboard(text);
    setCopiedState({ ...copiedState, [type]: true });
    toast({
      title: "Copied!",
      description: `${type} color code has been copied to clipboard.`,
    });
    setTimeout(() => setCopiedState({ ...copiedState, [type]: false }), 2000);
  };

  const handleSvgDownload = () => {
    const svgContent = createSvgPalette(colorPalette);
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "color-palette.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Card className="w-full md:w-auto">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="w-[300px]">
              <ColorSpectrum
                lightness={lightness}
                chroma={chroma}
                hue={hue}
                onChange={handleSpectrumChange}
              />
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="lightness-slider" className="text-xs">
                    Lightness: {lightness.toFixed(1)}
                  </Label>
                  <Slider
                    id="lightness-slider"
                    min={0}
                    max={100}
                    step={0.1}
                    value={[lightness]}
                    onValueChange={(values) => setLightness(values[0])}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="chroma-slider" className="text-xs">
                    Chroma: {chroma.toFixed(1)}
                  </Label>
                  <Slider
                    id="chroma-slider"
                    min={0}
                    max={40}
                    step={0.1}
                    value={[chroma]}
                    onValueChange={(values) => setChroma(values[0])}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hue-slider" className="text-xs">
                    Hue: {hue.toFixed(1)}
                  </Label>
                  <Slider
                    id="hue-slider"
                    min={0}
                    max={360}
                    step={1}
                    value={[hue]}
                    onValueChange={(values) => setHue(values[0])}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full md:flex-1 md:max-w-[500px]">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-md"
                  style={{ backgroundColor: rgbColor }}
                ></div>
                <Label className="text-sm font-medium">Selected Color</Label>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>OKLCH:</strong> {oklchColor}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(oklchColor, "OKLCH")}
                  >
                    {copiedState["OKLCH"] ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    <strong>RGB:</strong> {rgbColor}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(rgbColor, "RGB")}
                  >
                    {copiedState["RGB"] ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    <strong>HEX:</strong> {hexColor}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(hexColor, "HEX")}
                  >
                    {copiedState["HEX"] ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Color Palette</Label>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <Label htmlFor="palette-count" className="text-xs">
                    Colors
                  </Label>
                  <Input
                    id="palette-count"
                    type="number"
                    min={3}
                    max={10}
                    value={paletteCount}
                    onChange={(e) => setPaletteCount(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="tint-strength" className="text-xs">
                    Tint Strength
                  </Label>
                  <Input
                    id="tint-strength"
                    type="number"
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    value={tintStrength}
                    onChange={(e) => setTintStrength(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex">
                {colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 h-8 first:rounded-l-md last:rounded-r-md cursor-pointer relative group"
                    style={{ backgroundColor: color }}
                    onClick={() => handleCopy(color, `Palette${index}`)}
                    title={color}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white text-xs">
                      {color}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSvgDownload} size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download SVG
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
