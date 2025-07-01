import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MessageSquare, User, Bot, Play, Code, ArrowRight } from "lucide-react";

// Define types for the component
interface Message {
  role: "user" | "agent" | "bot" | "system";
  content: string;
}

interface Example {
  id: string;
  title: string;
  description: string;
  type: "agentic" | "non-agentic";
  messages: Message[];
}

interface ExamplesProps {
  scrollPosition: number;
  viewportHeight: number;
}

const Examples = ({ scrollPosition, viewportHeight }: ExamplesProps) => {
  const containerRef = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeExample, setActiveExample] = useState("chat");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoExampleIndex, setAutoExampleIndex] = useState(0);

  const examples: Example[] = [
    {
      id: "chat",
      title: "Conversational Agent",
      description:
        "An intelligent chatbot that maintains context and provides helpful responses",
      type: "agentic",
      messages: [
        { role: "user", content: "I need help planning a trip to Japan" },
        {
          role: "agent",
          content:
            "I'd be happy to help you plan your trip to Japan! Let me gather some information first. What time of year are you planning to visit?",
        },
        { role: "user", content: "I'm thinking about spring, maybe April" },
        {
          role: "agent",
          content:
            "Perfect timing! April is cherry blossom season. Let me create a personalized itinerary based on your interests. What activities do you enjoy most?",
        },
      ],
    },
    {
      id: "workflow",
      title: "Workflow Automation",
      description: "Automated task execution with decision-making capabilities",
      type: "agentic",
      messages: [
        { role: "system", content: "Workflow initiated: Email processing" },
        { role: "agent", content: "Analyzing incoming emails..." },
        {
          role: "agent",
          content: "Found 3 urgent emails requiring immediate attention",
        },
        {
          role: "agent",
          content: "Categorizing and prioritizing based on sender and content",
        },
        {
          role: "agent",
          content: "Scheduling follow-up tasks and sending notifications",
        },
      ],
    },
    {
      id: "simple",
      title: "Simple Q&A Bot",
      description: "Basic question-answering without context or learning",
      type: "non-agentic",
      messages: [
        { role: "user", content: "What is the weather today?" },
        {
          role: "bot",
          content:
            "I don't have access to current weather data. Please check a weather service.",
        },
        { role: "user", content: "How do I reset my password?" },
        {
          role: "bot",
          content:
            'To reset your password, click "Forgot Password" on the login page.',
        },
      ],
    },
  ];

  // Calculate scroll progress within this section (viewport size agnostic)
  useEffect(() => {
    if (!viewportHeight) return;

    const headerHeight = 64;
    // Match the calculations from App.jsx
    const sectionStart = viewportHeight * 0.8 + viewportHeight * 3; // After hero + features
    const sectionHeight = viewportHeight * 3; // More space for examples
    const sectionEnd = sectionStart + sectionHeight;

    // Add buffer zones for smoother transitions
    const bufferStart = sectionStart - viewportHeight * 0.3; // Start effects 30% early
    const bufferEnd = sectionEnd - viewportHeight * 0.2; // End effects 20% late

    if (scrollPosition >= bufferStart && scrollPosition <= bufferEnd) {
      // Normalize progress with buffer zones
      const effectiveStart = Math.max(0, scrollPosition - sectionStart);
      const effectiveProgress = effectiveStart / (sectionHeight * 0.7); // Use 70% of section for transitions
      const sectionProgress = Math.max(0, Math.min(1, effectiveProgress));

      const exampleIndex = Math.floor(sectionProgress * examples.length);
      const clampedIndex = Math.max(
        0,
        Math.min(exampleIndex, examples.length - 1)
      );

      setAutoExampleIndex(clampedIndex);

      if (!isPlaying) {
        const newExample = examples[clampedIndex];
        if (newExample && activeExample !== newExample.id) {
          setActiveExample(newExample.id);
          setChatMessages([]);
          setTimeout(() => {
            playExample(newExample.id, true);
          }, 300);
        }
      }
    }
  }, [
    scrollPosition,
    viewportHeight,
    examples.length,
    activeExample,
    isPlaying,
  ]);

  const playExample = async (exampleId: string, isAuto = false) => {
    const example = examples.find((e) => e.id === exampleId);
    if (!example) return;

    if (!isAuto) setIsPlaying(true);
    setChatMessages([]);

    for (let i = 0; i < example.messages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, isAuto ? 600 : 1200));
      setChatMessages((prev) => [...prev, example.messages[i]]);
    }

    if (!isAuto) setIsPlaying(false);
  };

  const currentExample = examples.find((e) => e.id === activeExample);
  const sectionHeight = viewportHeight ? viewportHeight * 3 : "300vh";

  return (
    <div className="scroll-container" style={{ height: sectionHeight }}>
      <section
        ref={containerRef}
        id="examples"
        className="sticky top-16 h-screen bg-gray-50 z-30 flex items-center"
      >
        {/* Left and right borders to match the overall design */}
        <div className="absolute top-0 left-0 bottom-0 border-l border-gray-300" />
        <div className="absolute top-0 right-0 bottom-0 border-r border-gray-300" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-40">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See Agents in
              <br />
              <span className="text-gradient">Action</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interactive examples showcasing different agent patterns and
              capabilities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {examples.map((example, index) => {
              const isActive = autoExampleIndex >= index;
              const isSelected = activeExample === example.id;

              return (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView
                      ? {
                          opacity: isActive ? 1 : 0.5,
                          y: 0,
                        }
                      : {}
                  }
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`example-card p-6 rounded-xl border-2 cursor-pointer ${
                    isSelected
                      ? "active border-modern-blue bg-white shadow-lg"
                      : isActive
                        ? "border-border-gray bg-white hover:border-gray-300"
                        : "border-gray-200 bg-gray-50"
                  }`}
                  onClick={() => {
                    setActiveExample(example.id);
                    playExample(example.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        isSelected
                          ? "text-gray-900"
                          : isActive
                            ? "text-gray-800"
                            : "text-gray-600"
                      }`}
                    >
                      {example.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        example.type === "agentic"
                          ? "bg-blue-100 text-modern-blue"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {example.type}
                    </span>
                  </div>
                  <p
                    className={`text-sm mb-4 transition-colors duration-300 ${
                      isSelected
                        ? "text-gray-600"
                        : isActive
                          ? "text-gray-500"
                          : "text-gray-400"
                    }`}
                  >
                    {example.description}
                  </p>
                  <div
                    className={`flex items-center text-sm font-medium transition-colors duration-300 ${
                      isSelected
                        ? "text-modern-blue"
                        : isActive
                          ? "text-gray-600"
                          : "text-gray-400"
                    }`}
                  >
                    <span>Try Example</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-2xl border border-border-gray shadow-lg overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-border-gray">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {currentExample?.title}
                  </h3>
                </div>
                <button
                  onClick={() => playExample(activeExample)}
                  disabled={isPlaying}
                  className="flex items-center space-x-2 px-4 py-2 bg-modern-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isPlaying ? "Playing..." : "Play Demo"}</span>
                </button>
              </div>
            </div>

            <div className="h-96 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={`${activeExample}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`flex items-start space-x-3 mb-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role !== "user" && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "agent"
                            ? "bg-blue-100"
                            : message.role === "bot"
                              ? "bg-gray-100"
                              : "bg-green-100"
                        }`}
                      >
                        {message.role === "agent" || message.role === "bot" ? (
                          <Bot
                            className={`w-4 h-4 ${
                              message.role === "agent"
                                ? "text-modern-blue"
                                : "text-gray-600"
                            }`}
                          />
                        ) : (
                          <Code className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-modern-blue text-white"
                          : message.role === "agent"
                            ? "bg-blue-50 text-gray-900"
                            : message.role === "system"
                              ? "bg-green-50 text-gray-900"
                              : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {chatMessages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Scroll to see the {currentExample?.title} in action</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress indicator */}
          <div className="mt-6 flex justify-center space-x-2">
            {examples.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  autoExampleIndex >= index ? "bg-modern-blue" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Examples;
