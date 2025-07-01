import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  Zap,
  MessageSquare,
  Palette,
  Link2,
  Cloud,
  Code2,
  Terminal,
  Cpu,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Play,
  FileText,
  Database,
  GitBranch,
  Monitor,
  Server,
  Image as ImageIcon,
  Video,
  Mic,
} from "lucide-react";
import { InteractiveHoverButton } from "./interactive-hover-button";
import { GlowEffect } from "../glow-effect";
const NewFeatures = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const features = [
    {
      icon: Brain,
      title: "Every Major AI Model",
      description:
        "OpenAI GPT-4, Anthropic Claude, Google Gemini, and more - all in one interface",
      gradient: "from-purple-500 to-blue-500",
      size: "large",
      demo: "models",
      badges: ["GPT-4", "Claude 3.5", "Gemini Pro", "LLaMA 2"],
    },
    {
      icon: Link2,
      title: "MCP Protocol",
      description: "Connect to remote Model Context Protocol servers",
      gradient: "from-yellow-500 to-orange-500",
      size: "small",
      demo: "mcp",
    },
    {
      icon: MessageSquare,
      title: "Universal Chat UI",
      description: "Test any model with our feature-rich interface",
      gradient: "from-green-500 to-teal-500",
      size: "small",
      demo: "chat",
    },
    {
      icon: Palette,
      title: "Media Generation",
      description:
        "Create images with Replicate and DALL-E, generate videos, and synthesize speech with ElevenLabs",
      gradient: "from-red-500 to-pink-500",
      size: "medium",
      demo: "media",
      subFeatures: ["Images", "Videos", "Speech"],
    },
    {
      icon: Cloud,
      title: "Cloudflare Integration",
      description: "Deploy agents at the edge with Workers AI",
      gradient: "from-indigo-500 to-purple-500",
      size: "small",
      demo: "cloudflare",
    },
    {
      icon: Zap,
      title: "Agent Development",
      description:
        "Build, test, and iterate on autonomous agents with hot-reload and real-time debugging",
      gradient: "from-blue-500 to-cyan-500",
      size: "medium",
      demo: "agents",
      codeSnippet: true,
    },
  ];

  const ModelDemo = () => (
    <div className="space-y-3 mt-6">
      {["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro"].map((model, idx) => (
        <motion.div
          key={model}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.2 + 0.5 }}
          className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-700/10"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            <span className="text-sm text-gray-700/80">{model}</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "60%" }}
            transition={{ duration: 1, delay: idx * 0.2 + 1 }}
            className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          />
        </motion.div>
      ))}
    </div>
  );

  const MediaDemo = () => (
    <div className="grid grid-cols-3 gap-2 mt-6">
      {[
        { icon: ImageIcon, label: "Images", color: "from-pink-500 to-red-500" },
        { icon: Video, label: "Videos", color: "from-blue-500 to-purple-500" },
        { icon: Mic, label: "Speech", color: "from-green-500 to-teal-500" },
      ].map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.2 + 0.5 }}
          whileHover={{ scale: 1.05 }}
          className={`p-4 bg-gradient-to-br ${item.color} rounded-lg text-center cursor-pointer shadow-lg shadow-gray-500/50`}
        >
          <item.icon className="w-6 h-6  mx-auto mb-2" />
          <span className="text-xs font-medium text-gray-700/80">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );

  const AgentDemo = () => (
    <div className="mt-6 space-y-3">
      <div className="bg-gray-200/10 rounded-lg p-4 border border-green-500/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-green-500 font-mono">agent.py</span>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center space-x-1 text-green-500"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs">RUNNING</span>
          </motion.div>
        </div>
        <div className="font-mono text-xs space-y-1">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-500"
          >
            def autonomous_agent():
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-yellow-500 ml-4"
          >
            while True:
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-purple-500 ml-8"
          >
            task = get_next_task()
          </motion.div>
        </div>
      </div>
    </div>
  );

  const ChatDemo = () => (
    <div className="mt-6 space-y-3">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-start space-x-3"
      >
        <div className="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
          <span className="text-xs ">U</span>
        </div>
        <div className="bg-gray-200/50 rounded-lg p-3 flex-1">
          <motion.p
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.7 }}
            className="text-xs overflow-hidden whitespace-nowrap"
          >
            How do I implement OAuth in React?
          </motion.p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="flex items-start space-x-3"
      >
        <div className="w-6 h-6 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-3 h-3 " />
          </motion.div>
        </div>
        <div className="bg-gray-200/50 rounded-lg p-3 flex-1">
          <motion.p
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 2, delay: 1.4 }}
            className="text-xs overflow-hidden whitespace-nowrap"
          >
            I'll help you implement OAuth authentication...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <section
      id="features"
      className="relative py-32 px-6 overflow-hidden border-t border/10 shadow-xl shadow-purple-500/25"
    >
      {/* Enhanced Multi-layered Background System */}
      <div className="absolute inset-0">
        {/* Base gradient with data flow theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/30" />

        {/* Perspective grid overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            transform: "perspective(1000px) rotateX(45deg) translateZ(-200px)",
          }}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 3, delay: 1 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(246, 92, 161, 0.3) 1px, transparent 1px),
                linear-gradient(180deg, rgba(246, 92, 123, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </motion.div>

        {/* Circuit board pattern overlay */}
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0.05 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 4, delay: 2 }}
        >
          <svg className="w-full h-full">
            <defs>
              <pattern
                id="circuit-features"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <g stroke="#8B5CF6" strokeWidth="0.5" fill="none">
                  <circle cx="25" cy="25" r="0.5" fill="#8B5CF6" />
                  <path d="M25,0 L25,25 M0,25 L25,25 M25,25 L50,25 M25,25 L25,50" />
                  <circle cx="0" cy="25" r="0.3" fill="#EC4899" />
                  <circle cx="50" cy="25" r="0.3" fill="#EC4899" />
                  <circle cx="25" cy="0" r="0.3" fill="#3B82F6" />
                  <circle cx="25" cy="50" r="0.3" fill="#3B82F6" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-features)" />
          </svg>
        </motion.div>
        {/* Data stream network */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="dataStream1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient
              id="dataStream2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Horizontal data streams */}
          <motion.path
            d="M -50,100 Q 150,95 350,105 T 750,100"
            stroke="url(#dataStream1)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 6,
              delay: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />

          <motion.path
            d="M -50,200 Q 200,190 400,210 T 800,200"
            stroke="url(#dataStream1)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 8,
              delay: 3,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />

          {/* Diagonal connection lines */}
          <motion.path
            d="M 100,50 Q 300,150 500,100 Q 700,50 900,150"
            stroke="url(#dataStream2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 7,
              delay: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />

          {/* Vertical data flows */}
          <motion.path
            d="M 150,-50 Q 155,100 160,250 T 170,550"
            stroke="url(#dataStream2)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 5,
              delay: 4,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </svg>

        {/* Neural network nodes */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + (i % 4) * 20}%`,
                top: `${20 + Math.floor(i / 4) * 25}%`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full border-2 border-blue-400/50 bg-blue-400/20"
                  style={{
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                  }}
                />
                <motion.div
                  className="absolute inset-0 w-4 h-4 rounded-full border-2 border-blue-400"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced floating orbs with data themes */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 rounded-full blur-xl"
          style={{
            y,
            rotate,
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.3) 50%, transparent 100%)",
            boxShadow: "0 0 60px rgba(59, 130, 246, 0.4)",
          }}
        />

        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-16 h-16 rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%)",
            boxShadow: "0 0 50px rgba(236, 72, 153, 0.3)",
          }}
        />

        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute bottom-40 left-1/4 w-24 h-24 rounded-full blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)",
            boxShadow: "0 0 70px rgba(16, 185, 129, 0.3)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 mb-8 text-sm border border-purple-500/20 rounded-full bg-purple-500/10 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-purple-500">Powerful Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-primary to-muted-foreground/50 bg-clip-text text-transparent">
              Everything you need
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              to build the future
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-700/80 max-w-3xl mx-auto"
          >
            Production-ready AI agents with enterprise-grade tooling
          </motion.p>
        </motion.div>

        {/* Enhanced Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const gridSpan =
              feature.size === "large"
                ? "md:col-span-2 md:row-span-2"
                : feature.size === "medium"
                  ? "md:col-span-2 md:row-span-1"
                  : "md:col-span-1";

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`group relative ${gridSpan} bg-gray-50/20 backdrop-blur-sm border border-gray-700/10 rounded-2xl p-8 hover:border-gray-700/20 transition-all overflow-hidden`}
              >
                {/* Enhanced gradient overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.15 }}
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl transition-opacity`}
                />

                {/* Floating particles inside cards */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-4 right-4 w-2 h-2 bg-gray-50/40 rounded-full blur-sm"
                />
                <motion.div
                  animate={{
                    y: [0, 15, 0],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                  className="absolute bottom-6 left-6 w-1 h-1 bg-gray-50/30 rounded-full blur-sm"
                />

                {/* Corner accent glows */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.1 + 0.8,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-br ${feature.gradient} rounded-full shadow-lg`}
                />

                {/* Subtle glow effect on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.3 }}
                  className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl transition-opacity -z-10`}
                />

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 " />
                  </motion.div>

                  <h3 className="text-2xl font-semibold mb-4  group-hover:text-purple-500 transition-colors duration-200">
                    {feature.title}
                  </h3>

                  <p className="text-gray-500 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Feature badges */}
                  {feature.badges && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {feature.badges.map((badge, idx) => (
                        <motion.span
                          key={badge}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 + 0.5 }}
                          className="px-3 py-1 text-xs bg-gray-50/10 rounded-full  backdrop-blur-sm border border-gray-700/10"
                        >
                          {badge}
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Sub-features for media */}
                  {feature.subFeatures && (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {feature.subFeatures.map((sub, idx) => (
                        <motion.div
                          key={sub}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 + 0.5 }}
                          className="text-center p-2 bg-gray-50/50 rounded-lg border border-gray-700/10"
                        >
                          <span className="text-xs ">{sub}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Interactive demos */}
                  {feature.demo === "models" && <ModelDemo />}
                  {feature.demo === "media" && <MediaDemo />}
                  {feature.demo === "agents" && <AgentDemo />}
                  {feature.demo === "chat" && <ChatDemo />}

                  {/* MCP Protocol visualization */}
                  {feature.demo === "mcp" && (
                    <div className="mt-6 space-y-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Local Agent</span>
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex items-center space-x-1"
                        >
                          <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                          <span>MCP Protocol</span>
                        </motion.div>
                        <span>Remote Server</span>
                      </div>
                    </div>
                  )}

                  {/* Cloudflare edge visualization */}
                  {feature.demo === "cloudflare" && (
                    <div className="mt-6">
                      <div className="grid grid-cols-3 gap-2">
                        {["US", "EU", "ASIA"].map((region, idx) => (
                          <motion.div
                            key={region}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.2 + 0.5 }}
                            className="text-center p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-white/10"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: idx * 0.5,
                              }}
                              className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2"
                            />
                            <span className="text-xs ">{region}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action button for large cards */}
                  {feature.size === "large" && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="mt-8 inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full  font-medium transition-all backdrop-blur-sm border border-purple-500/20"
                    >
                      Explore models
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-20"
        >
          <div className="relative w-fit mx-auto z-10">
            <GlowEffect
              colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
              mode="static"
              blur="strongest"
            />
            <InteractiveHoverButton
              text="See all features in action"
              className="px-8"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewFeatures;
