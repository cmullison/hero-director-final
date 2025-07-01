import { motion } from "framer-motion";
import React from "react";

interface AnimatedGradientBackgroundProps {
  /**
   * Type of separator design
   * @default "dots"
   */
  variant?: "dots" | "lines" | "minimal" | "fade";

  /**
   * Enables or disables the breathing animation effect.
   * @default false
   */
  Breathing?: boolean;

  /**
   * Primary accent color for the separator
   * @default "#8B5CF6"
   */
  accentColor?: string;

  /**
   * Additional class names for the separator container.
   * @default ""
   */
  containerClassName?: string;
}

/**
 * Sophisticated section separator with minimal, professional designs
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  variant = "dots",
  Breathing = false,
  accentColor = "#8B5CF6",
  containerClassName = "",
}) => {
  const DotSeparator = () => (
    <div className="flex items-center justify-center space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: accentColor }}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{
            opacity: Breathing ? [0.3, 0.7, 0.3] : 0.5,
            scale: Breathing ? [0.8, 1, 0.8] : 1,
          }}
          transition={{
            duration: 3,
            repeat: Breathing ? Infinity : 0,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const LinesSeparator = () => (
    <div className="flex items-center justify-center space-x-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="h-px bg-gradient-to-r from-transparent via-current to-transparent"
          style={{
            color: accentColor,
            width: i === 2 ? "40px" : i === 1 || i === 3 ? "20px" : "10px",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{
            opacity: Breathing ? [0.2, 0.6, 0.2] : 0.4,
            scaleX: 1,
          }}
          transition={{
            duration: 2,
            repeat: Breathing ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );

  const MinimalSeparator = () => (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-16 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`,
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{
          opacity: Breathing ? [0.6, 1, 0.6] : 0.8,
          scaleX: 1,
        }}
        transition={{
          duration: 2.5,
          repeat: Breathing ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
    </div>
  );

  const FadeSeparator = () => {
    // Convert hex to rgb for proper rgba usage
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 139, g: 92, b: 246 }; // fallback to purple
    };

    const rgb = hexToRgb(accentColor);

    return (
      <div className="relative h-full">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, 
              transparent 0%, 
              rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 30%,
              rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 50%,
              rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 70%,
              transparent 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: Breathing ? [0.7, 1, 0.7] : 0.9,
          }}
          transition={{
            duration: 4,
            repeat: Breathing ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  };

  const renderSeparator = () => {
    switch (variant) {
      case "lines":
        return <LinesSeparator />;
      case "minimal":
        return <MinimalSeparator />;
      case "fade":
        return <FadeSeparator />;
      default:
        return <DotSeparator />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={`absolute inset-0 flex items-center justify-center ${containerClassName}`}
    >
      {renderSeparator()}
    </motion.div>
  );
};

export default AnimatedGradientBackground;
