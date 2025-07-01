import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  GitBranch,
  Zap,
  Database,
  Network,
  Brain,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Patterns = ({
  scrollPosition,
  viewportHeight,
}: {
  scrollPosition: number;
  viewportHeight: number;
}) => {
  const containerRef = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedPattern, setSelectedPattern] = useState("reactive");
  const [autoPatternIndex, setAutoPatternIndex] = useState(0);

  const patterns = [
    {
      id: "reactive",
      title: "Reactive Agents",
      type: "agentic",
      icon: Zap,
      description: "Agents that respond to environmental changes and stimuli",
      characteristics: [
        "Event-driven responses",
        "Real-time adaptation",
        "Sensor-based input",
        "Immediate reactions",
      ],
      useCases: [
        "Monitoring systems",
        "Alert mechanisms",
        "Real-time dashboards",
        "IoT device management",
      ],
      complexity: "Medium",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: "deliberative",
      title: "Deliberative Agents",
      type: "agentic",
      icon: Brain,
      description: "Agents that plan and reason before taking action",
      characteristics: [
        "Goal-oriented planning",
        "Multi-step reasoning",
        "Knowledge representation",
        "Strategic decision making",
      ],
      useCases: [
        "Strategic planning",
        "Resource optimization",
        "Complex problem solving",
        "Decision support systems",
      ],
      complexity: "High",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      id: "hybrid",
      title: "Hybrid Agents",
      type: "agentic",
      icon: GitBranch,
      description: "Combining reactive and deliberative approaches",
      characteristics: [
        "Layered architecture",
        "Fast reflexes + planning",
        "Context switching",
        "Adaptive behavior",
      ],
      useCases: [
        "Autonomous vehicles",
        "Game AI",
        "Robotic systems",
        "Smart assistants",
      ],
      complexity: "Very High",
      color: "text-modern-blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "simple",
      title: "Simple Response",
      type: "non-agentic",
      icon: Target,
      description: "Basic input-output systems without learning or adaptation",
      characteristics: [
        "Fixed responses",
        "No learning capability",
        "Stateless operations",
        "Predictable behavior",
      ],
      useCases: [
        "FAQ systems",
        "Basic calculators",
        "Static content delivery",
        "Simple form processing",
      ],
      complexity: "Low",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  ];

  // Calculate scroll progress within this section (viewport size agnostic)
  useEffect(() => {
    if (!viewportHeight) return;

    const headerHeight = 64;
    // Match the calculations from App.jsx
    const sectionStart =
      viewportHeight * 0.8 + viewportHeight * 3 + viewportHeight * 3; // After hero + features + examples
    const sectionHeight = viewportHeight * 2.5; // Space for patterns
    const sectionEnd = sectionStart + sectionHeight;

    // Add buffer zones for smoother transitions
    const bufferStart = sectionStart - viewportHeight * 0.3; // Start effects 30% early
    const bufferEnd = sectionEnd - viewportHeight * 0.2; // End effects 20% late

    if (scrollPosition >= bufferStart && scrollPosition <= bufferEnd) {
      // Normalize progress with buffer zones
      const effectiveStart = Math.max(0, scrollPosition - sectionStart);
      const effectiveProgress = effectiveStart / (sectionHeight * 0.7); // Use 70% of section for transitions
      const sectionProgress = Math.max(0, Math.min(1, effectiveProgress));

      const patternIndex = Math.floor(sectionProgress * patterns.length);
      const clampedIndex = Math.max(
        0,
        Math.min(patternIndex, patterns.length - 1)
      );

      setAutoPatternIndex(clampedIndex);

      const newPattern = patterns[clampedIndex];
      if (newPattern && selectedPattern !== newPattern.id) {
        setSelectedPattern(newPattern.id);
      }
    }
  }, [scrollPosition, viewportHeight, patterns.length, selectedPattern]);

  const currentPattern = patterns.find((p) => p.id === selectedPattern);
  const sectionHeight = viewportHeight ? viewportHeight * 2.5 : "250vh";

  return (
    <div className="scroll-container" style={{ height: sectionHeight }}>
      <section
        ref={containerRef}
        id="patterns"
        className="sticky top-16 h-screen bg-white z-20 flex items-center"
      >
        {/* Left and right borders to match the overall design */}
        <div className="absolute top-0 left-0 bottom-0 border-l border-gray-300" />
        <div className="absolute top-0 right-0 bottom-0 border-r border-gray-300" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Agent Design
              <br />
              <span className="text-gradient">Patterns</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore different architectural patterns for building intelligent
              agents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            {patterns.map((pattern, index) => {
              const Icon = pattern.icon;
              const isActive = autoPatternIndex >= index;
              const isSelected = selectedPattern === pattern.id;

              return (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView
                      ? {
                          opacity: isActive ? 1 : 0.4,
                          y: 0,
                        }
                      : {}
                  }
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`pattern-card p-6 rounded-xl border-2 cursor-pointer ${
                    isSelected
                      ? `active ${pattern.borderColor} ${pattern.bgColor} shadow-lg`
                      : isActive
                        ? "border-border-gray bg-white hover:border-gray-300"
                        : "border-gray-200 bg-gray-50"
                  }`}
                  onClick={() => setSelectedPattern(pattern.id)}
                >
                  <div className="text-center">
                    <motion.div
                      className={`w-12 h-12 ${pattern.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}
                      animate={{
                        scale: isSelected ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className={`w-6 h-6 ${pattern.color}`} />
                    </motion.div>
                    <h3
                      className={`font-semibold mb-2 transition-colors duration-300 ${
                        isSelected
                          ? "text-gray-900"
                          : isActive
                            ? "text-gray-800"
                            : "text-gray-600"
                      }`}
                    >
                      {pattern.title}
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        pattern.type === "agentic"
                          ? "bg-blue-100 text-modern-blue"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {pattern.type}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {currentPattern && (
            <motion.div
              key={selectedPattern}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-2xl border border-border-gray p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div
                      className={`w-12 h-12 ${currentPattern.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <currentPattern.icon
                        className={`w-6 h-6 ${currentPattern.color}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentPattern.title}
                      </h3>
                      <p className="text-gray-600">
                        {currentPattern.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Key Characteristics
                      </h4>
                      <ul className="space-y-2">
                        {currentPattern.characteristics.map((char, index) => (
                          <motion.li
                            key={index}
                            className="flex items-center space-x-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{char}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Common Use Cases
                      </h4>
                      <ul className="space-y-2">
                        {currentPattern.useCases.map((useCase, index) => (
                          <motion.li
                            key={index}
                            className="flex items-center space-x-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: (index + 4) * 0.1,
                            }}
                          >
                            <ArrowRight className="w-4 h-4 text-modern-blue" />
                            <span className="text-gray-700">{useCase}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-600">
                        Complexity:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          currentPattern.complexity === "Low"
                            ? "bg-green-100 text-green-700"
                            : currentPattern.complexity === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : currentPattern.complexity === "High"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {currentPattern.complexity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border-gray">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Architecture Diagram
                  </h4>
                  <div className="relative h-64">
                    <svg viewBox="0 0 300 200" className="w-full h-full">
                      {selectedPattern === "reactive" && (
                        <>
                          <motion.rect
                            x="20"
                            y="80"
                            width="80"
                            height="40"
                            rx="8"
                            fill="#fef3c7"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          />
                          <text
                            x="60"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Sensors
                          </text>

                          <motion.rect
                            x="120"
                            y="80"
                            width="80"
                            height="40"
                            rx="8"
                            fill="#fef3c7"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          />
                          <text
                            x="160"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Reactor
                          </text>

                          <motion.rect
                            x="220"
                            y="80"
                            width="60"
                            height="40"
                            rx="8"
                            fill="#fef3c7"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                          />
                          <text
                            x="250"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Action
                          </text>

                          <motion.line
                            x1="100"
                            y1="100"
                            x2="120"
                            y2="100"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.8 }}
                          />
                          <motion.line
                            x1="200"
                            y1="100"
                            x2="220"
                            y2="100"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 1.0 }}
                          />
                        </>
                      )}

                      {selectedPattern === "deliberative" && (
                        <>
                          <motion.rect
                            x="50"
                            y="40"
                            width="80"
                            height="30"
                            rx="6"
                            fill="#ede9fe"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          />
                          <text
                            x="90"
                            y="60"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Knowledge
                          </text>

                          <motion.rect
                            x="50"
                            y="85"
                            width="80"
                            height="30"
                            rx="6"
                            fill="#ede9fe"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          />
                          <text
                            x="90"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Planner
                          </text>

                          <motion.rect
                            x="50"
                            y="130"
                            width="80"
                            height="30"
                            rx="6"
                            fill="#ede9fe"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                          />
                          <text
                            x="90"
                            y="150"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Executor
                          </text>

                          <motion.rect
                            x="170"
                            y="85"
                            width="80"
                            height="30"
                            rx="6"
                            fill="#ede9fe"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                          />
                          <text
                            x="210"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Actions
                          </text>
                        </>
                      )}

                      {selectedPattern === "hybrid" && (
                        <>
                          <motion.rect
                            x="20"
                            y="30"
                            width="100"
                            height="25"
                            rx="6"
                            fill="#dbeafe"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          />
                          <text
                            x="70"
                            y="47"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Deliberative Layer
                          </text>

                          <motion.rect
                            x="20"
                            y="70"
                            width="100"
                            height="25"
                            rx="6"
                            fill="#dbeafe"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          />
                          <text
                            x="70"
                            y="87"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Reactive Layer
                          </text>

                          <motion.rect
                            x="150"
                            y="50"
                            width="80"
                            height="25"
                            rx="6"
                            fill="#dbeafe"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                          />
                          <text
                            x="190"
                            y="67"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Coordinator
                          </text>
                        </>
                      )}

                      {selectedPattern === "simple" && (
                        <>
                          <motion.rect
                            x="50"
                            y="80"
                            width="60"
                            height="40"
                            rx="8"
                            fill="#f9fafb"
                            stroke="#6b7280"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          />
                          <text
                            x="80"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Input
                          </text>

                          <motion.rect
                            x="130"
                            y="80"
                            width="60"
                            height="40"
                            rx="8"
                            fill="#f9fafb"
                            stroke="#6b7280"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                          />
                          <text
                            x="160"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Process
                          </text>

                          <motion.rect
                            x="210"
                            y="80"
                            width="60"
                            height="40"
                            rx="8"
                            fill="#f9fafb"
                            stroke="#6b7280"
                            strokeWidth="2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                          />
                          <text
                            x="240"
                            y="105"
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            Output
                          </text>

                          <motion.line
                            x1="110"
                            y1="100"
                            x2="130"
                            y2="100"
                            stroke="#6b7280"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.8 }}
                          />
                          <motion.line
                            x1="190"
                            y1="100"
                            x2="210"
                            y2="100"
                            stroke="#6b7280"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 1.0 }}
                          />
                        </>
                      )}

                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress indicator */}
          <div className="mt-6 flex justify-center space-x-2">
            {patterns.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  autoPatternIndex >= index ? "bg-modern-blue" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Patterns;
