import React, { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Bot,
  MessageSquare,
  Zap,
  Code,
  GitBranch,
  Database,
  Globe,
  Shield,
  Cpu,
  Network,
  type LucideIcon,
} from "lucide-react";

// Define types for the component
interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  svgColor: string;
  svgBgColor: string;
}

interface DiagramComponent {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FeaturesProps {
  scrollPosition: number;
  viewportHeight: number;
}

const Features = ({ scrollPosition, viewportHeight }: FeaturesProps) => {
  const containerRef = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features: Feature[] = [
    {
      id: "agents",
      icon: Bot,
      title: "Intelligent Agents",
      description: "Create autonomous agents with decision-making capabilities",
      color: "text-modern-blue",
      bgColor: "bg-blue-50",
      svgColor: "#3b82f6",
      svgBgColor: "#eff6ff",
    },
    {
      id: "patterns",
      icon: GitBranch,
      title: "Agentic Patterns",
      description:
        "Explore different architectural patterns for agent behavior",
      color: "text-modern-red",
      bgColor: "bg-red-50",
      svgColor: "#ef4444",
      svgBgColor: "#fef2f2",
    },
    {
      id: "testing",
      icon: Zap,
      title: "Real-time Testing",
      description: "Test and validate agent behaviors in real-time",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      svgColor: "#d97706",
      svgBgColor: "#fefce8",
    },
    {
      id: "integration",
      icon: Network,
      title: "Easy Integration",
      description: "Connect with APIs, databases, and external services",
      color: "text-green-600",
      bgColor: "bg-green-50",
      svgColor: "#059669",
      svgBgColor: "#f0fdf4",
    },
    {
      id: "monitoring",
      icon: Cpu,
      title: "Performance Monitoring",
      description: "Monitor agent performance and resource usage",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      svgColor: "#9333ea",
      svgBgColor: "#faf5ff",
    },
    {
      id: "security",
      icon: Shield,
      title: "Secure Sandbox",
      description: "Safe environment for testing and development",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      svgColor: "#6366f1",
      svgBgColor: "#eef2ff",
    },
  ];

  // Calculate scroll progress within this section (viewport size agnostic)
  useEffect(() => {
    if (!viewportHeight) return;

    const headerHeight = 64;
    // Start the section earlier and give it more space
    const sectionStart = viewportHeight * 0.8; // Match App.jsx heroEnd
    const sectionHeight = viewportHeight * 3; // Match App.jsx section height
    const sectionEnd = sectionStart + sectionHeight;

    // Add buffer zones for smoother transitions
    const bufferStart = sectionStart - viewportHeight * 0.2; // Start effects 20% early
    const bufferEnd = sectionEnd - viewportHeight * 0.2; // End effects 20% late

    if (scrollPosition >= bufferStart && scrollPosition <= bufferEnd) {
      // Normalize progress with buffer zones
      const effectiveStart = Math.max(0, scrollPosition - sectionStart);
      const effectiveProgress = effectiveStart / (sectionHeight * 0.8); // Use 80% of section for transitions
      const sectionProgress = Math.max(0, Math.min(1, effectiveProgress));

      const featureIndex = Math.floor(sectionProgress * features.length);
      const clampedIndex = Math.max(
        0,
        Math.min(featureIndex, features.length - 1)
      );

      setActiveFeatureIndex(clampedIndex);
      if (!hoveredFeature) {
        setHoveredFeature(features[clampedIndex]?.id);
      }
    }
  }, [scrollPosition, viewportHeight, features.length, hoveredFeature]);

  const diagramComponents: Record<string, DiagramComponent> = {
    agents: { x: 20, y: 20, width: 120, height: 80 },
    patterns: { x: 160, y: 20, width: 120, height: 80 },
    testing: { x: 300, y: 20, width: 120, height: 80 },
    integration: { x: 20, y: 120, width: 120, height: 80 },
    monitoring: { x: 160, y: 120, width: 120, height: 80 },
    security: { x: 300, y: 120, width: 120, height: 80 },
  };

  const sectionHeight = viewportHeight ? viewportHeight * 3 : "300vh";

  return (
    <div className="scroll-container" style={{ height: sectionHeight }}>
      <section
        ref={containerRef}
        id="features"
        className="sticky top-16 h-screen bg-white z-40 flex items-center"
      >
        {/* Left and right borders to match the overall design */}
        <div className="absolute top-0 left-0 bottom-0 border-l border-gray-300" />
        <div className="absolute top-0 right-0 bottom-0 border-r border-gray-300" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-50">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <br />
              <span className="text-gradient">Agent Development</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, test, and deploy intelligent agents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeatureIndex === index;
                const isHighlighted = hoveredFeature === feature.id;

                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className={`feature-item p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isActive ? "active" : ""
                    } ${
                      isHighlighted
                        ? `shadow-lg border-gray-300 ${feature.bgColor}`
                        : "border-gray-300 bg-white hover:shadow-md"
                    }`}
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div
                        className={`p-3 rounded-lg ${feature.bgColor}`}
                        animate={{
                          scale: isHighlighted ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </motion.div>
                      <div className="flex-1">
                        <h3
                          className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                            isHighlighted ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {feature.title}
                        </h3>
                        <p
                          className={`transition-colors duration-300 ${
                            isHighlighted ? "text-gray-700" : "text-gray-600"
                          }`}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Agent Architecture
                </h3>
                <div className="relative w-full h-64">
                  <svg viewBox="0 0 440 220" className="w-full h-full">
                    {/* Connection lines */}
                    <motion.line
                      x1="80"
                      y1="60"
                      x2="160"
                      y2="60"
                      stroke="#d1d5db"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: activeFeatureIndex >= 1 ? 1 : 0 }}
                      transition={{ duration: 0.8 }}
                    />
                    <motion.line
                      x1="220"
                      y1="60"
                      x2="300"
                      y2="60"
                      stroke="#d1d5db"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: activeFeatureIndex >= 2 ? 1 : 0 }}
                      transition={{ duration: 0.8 }}
                    />
                    <motion.line
                      x1="80"
                      y1="100"
                      x2="80"
                      y2="120"
                      stroke="#d1d5db"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: activeFeatureIndex >= 3 ? 1 : 0 }}
                      transition={{ duration: 0.8 }}
                    />
                    <motion.line
                      x1="220"
                      y1="100"
                      x2="220"
                      y2="120"
                      stroke="#d1d5db"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: activeFeatureIndex >= 4 ? 1 : 0 }}
                      transition={{ duration: 0.8 }}
                    />

                    {/* Feature components */}
                    {Object.entries(diagramComponents).map(
                      ([key, pos], index) => {
                        const feature = features.find((f) => f.id === key);
                        if (!feature) return null;

                        const Icon = feature.icon;
                        const isHighlighted = hoveredFeature === key;
                        const isRevealed = activeFeatureIndex >= index;

                        return (
                          <motion.g
                            key={key}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: isRevealed ? 1 : 0.3,
                              scale: isHighlighted ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.6 }}
                          >
                            <rect
                              x={pos.x}
                              y={pos.y}
                              width={pos.width}
                              height={pos.height}
                              rx="8"
                              fill={
                                isHighlighted ? feature.svgBgColor : "#ffffff"
                              }
                              stroke={
                                isHighlighted ? feature.svgColor : "#d1d5db"
                              }
                              strokeWidth="1"
                            />
                            <foreignObject
                              x={pos.x + 10}
                              y={pos.y + 10}
                              width={pos.width - 20}
                              height={pos.height - 20}
                            >
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <Icon
                                  className={`w-6 h-6 mb-2 transition-colors duration-300 ${
                                    isHighlighted
                                      ? feature.color
                                      : "text-gray-600"
                                  }`}
                                />
                                <span
                                  className={`text-xs font-medium transition-colors duration-300 ${
                                    isHighlighted
                                      ? "text-gray-900"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {feature.title}
                                </span>
                              </div>
                            </foreignObject>
                          </motion.g>
                        );
                      }
                    )}
                  </svg>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-6 flex justify-center space-x-2">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeFeatureIndex >= index
                        ? "bg-modern-blue"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
