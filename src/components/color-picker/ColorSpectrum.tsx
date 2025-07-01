import React, { useRef, useEffect, useState } from "react";
import { getSpectrumColor, isValidOklch } from "../../lib/colorConversions";

interface ColorSpectrumProps {
  lightness: number;
  chroma: number;
  hue: number;
  onChange: (chroma: number, hue: number) => void;
}

export function ColorSpectrum({
  lightness,
  chroma,
  hue,
  onChange,
}: ColorSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const c = (x / width) * 40;
        const h = (1 - y / height) * 360;
        if (isValidOklch(lightness, c, h)) {
          ctx.fillStyle = getSpectrumColor(
            x / width,
            1 - y / height,
            lightness
          );
        } else {
          ctx.fillStyle = "#CCCCCC"; // Gray for invalid colors
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw current color position
    const x = (chroma / 40) * width;
    const y = (1 - hue / 360) * height;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.strokeStyle = lightness > 50 ? "black" : "white";
    ctx.stroke();
  }, [lightness, chroma, hue]);

  const handleInteraction = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const newChroma = (x / rect.width) * 40;
    const newHue = (1 - y / rect.height) * 360;

    if (isValidOklch(lightness, newChroma, newHue)) {
      onChange(newChroma, newHue);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="cursor-crosshair touch-none rounded-[3px]"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={(e) => isDragging && handleInteraction(e)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleInteraction(e);
      }}
      onTouchMove={(e) => isDragging && handleInteraction(e)}
      onTouchEnd={() => setIsDragging(false)}
    />
  );
}
