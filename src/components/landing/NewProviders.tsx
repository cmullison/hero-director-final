import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Zap,
  Brain,
  Code2,
  Image as ImageIcon,
  Video,
  Mic,
  MessageSquare,
  Cpu,
  Globe,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Database,
  Terminal,
  Monitor,
  Cloud,
  Palette,
  Eye,
  Music,
  Volume2,
  Play,
  Star,
  TrendingUp,
} from "lucide-react";
import { GlowEffect } from "../glow-effect";
import { InteractiveHoverButton } from "./interactive-hover-button";

const NewProviders = () => {
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [hoveredCapability, setHoveredCapability] = useState<string | null>(
    null
  );

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  const providers = [
    {
      name: "OpenAI",
      models: ["GPT-4o", "GPT-4 Turbo", "DALL-E 3", "Whisper"],
      color: "from-green-400 to-emerald-600",
      accent: "green",
      icon: Brain,
      capabilities: [
        { name: "Reasoning", icon: Brain, strength: 95 },
        { name: "Code Gen", icon: Code2, strength: 90 },
        { name: "Images", icon: ImageIcon, strength: 88 },
        { name: "Voice", icon: Mic, strength: 92 },
      ],
      specialty: "The gold standard for reasoning and general intelligence",
      contextSize: "128k tokens",
      demo: "reasoning",
    },
    {
      name: "Anthropic",
      models: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku"],
      color: "from-orange-400 to-red-500",
      accent: "orange",
      icon: MessageSquare,
      capabilities: [
        { name: "Long Context", icon: FileText, strength: 98 },
        { name: "Analysis", icon: Database, strength: 94 },
        { name: "Safety", icon: CheckCircle, strength: 96 },
        { name: "Writing", icon: MessageSquare, strength: 95 },
      ],
      specialty: "Unmatched context length and thoughtful analysis",
      contextSize: "200k tokens",
      demo: "analysis",
    },
    {
      name: "Google",
      models: ["Gemini 1.5 Pro", "Gemini Ultra", "PaLM 2"],
      color: "from-blue-400 to-blue-600",
      accent: "blue",
      icon: Globe,
      capabilities: [
        { name: "Multimodal", icon: Eye, strength: 93 },
        { name: "Search", icon: Globe, strength: 97 },
        { name: "Speed", icon: Zap, strength: 89 },
        { name: "Scale", icon: TrendingUp, strength: 95 },
      ],
      specialty: "Massive context windows and multimodal understanding",
      contextSize: "1M tokens",
      demo: "multimodal",
    },
    {
      name: "Cloudflare",
      models: ["Workers AI", "Llama 2", "Code Llama", "Stable Diffusion"],
      color: "from-yellow-400 to-orange-500",
      accent: "yellow",
      icon: Cloud,
      capabilities: [
        { name: "Edge Deploy", icon: Zap, strength: 96 },
        { name: "Low Latency", icon: Clock, strength: 94 },
        { name: "Scale", icon: Cloud, strength: 92 },
        { name: "Cost", icon: TrendingUp, strength: 88 },
      ],
      specialty: "Lightning-fast edge deployment and global distribution",
      contextSize: "Variable",
      demo: "edge",
    },
    {
      name: "Replicate",
      models: ["SDXL", "Llama Vision", "MusicGen", "AnimateDiff"],
      color: "from-purple-400 to-pink-500",
      accent: "purple",
      icon: Palette,
      capabilities: [
        { name: "Images", icon: ImageIcon, strength: 95 },
        { name: "Videos", icon: Video, strength: 91 },
        { name: "Music", icon: Music, strength: 87 },
        { name: "Fine-tuning", icon: Cpu, strength: 93 },
      ],
      specialty: "Open-source models for creative and specialized tasks",
      contextSize: "Model-specific",
      demo: "creative",
    },
    {
      name: "ElevenLabs",
      models: ["Multilingual v2", "Voice Cloning", "Sound Effects"],
      color: "from-indigo-400 to-purple-500",
      accent: "indigo",
      icon: Volume2,
      capabilities: [
        { name: "Voice Clone", icon: Mic, strength: 97 },
        { name: "Multilingual", icon: Globe, strength: 94 },
        { name: "Realistic", icon: Star, strength: 96 },
        { name: "Real-time", icon: Zap, strength: 89 },
      ],
      specialty: "The most realistic AI voice synthesis available",
      contextSize: "Text-based",
      demo: "voice",
    },
  ];

  const capabilities = [
    { name: "Reasoning", icon: Brain, color: "text-purple-400" },
    { name: "Code Generation", icon: Code2, color: "text-blue-400" },
    { name: "Image Creation", icon: ImageIcon, color: "text-pink-400" },
    { name: "Voice Synthesis", icon: Mic, color: "text-green-400" },
    { name: "Video Generation", icon: Video, color: "text-orange-400" },
    { name: "Long Context", icon: FileText, color: "text-yellow-400" },
    { name: "Multimodal", icon: Eye, color: "text-cyan-400" },
    { name: "Edge Deployment", icon: Cloud, color: "text-indigo-400" },
  ];

  const ReasoningDemo = () => (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50/50 rounded-lg p-3 border border-green-500/30"
      >
        <div className="text-xs text-green-500 mb-2">Complex Reasoning</div>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "95%" }}
          transition={{ duration: 2, delay: 0.5 }}
          className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
        />
      </motion.div>
      <div className="text-xs text-gray-500/80">
        Solves multi-step problems with human-like reasoning
      </div>
    </div>
  );

  const AnalysisDemo = () => (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50/50 rounded-lg p-3 border border-orange-500/30"
      >
        <div className="text-xs text-orange-500 mb-2">Document Analysis</div>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-orange-500" />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "98%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="flex-1 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          />
        </div>
      </motion.div>
      <div className="text-xs text-gray-500/80">
        200k tokens • Full documents
      </div>
    </div>
  );

  const MultimodalDemo = () => (
    <div className="grid grid-cols-2 gap-2">
      {[
        { icon: Eye, label: "Vision", color: "from-blue-400 to-cyan-500" },
        { icon: FileText, label: "Text", color: "from-blue-500 to-purple-500" },
        { icon: Code2, label: "Code", color: "from-green-400 to-blue-500" },
        { icon: Database, label: "Data", color: "from-purple-400 to-pink-500" },
      ].map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 + 0.3 }}
          className={`p-2 bg-gradient-to-r ${item.color} rounded-lg text-center`}
        >
          <item.icon className="w-4 h-4 text-white mx-auto mb-1" />
          <span className="text-xs text-white">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );

  const EdgeDemo = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {["US", "EU", "ASIA"].map((region, idx) => (
          <motion.div
            key={region}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.2 + 0.3 }}
            className="text-center p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
              className="w-2 h-2 bg-yellow-500 rounded-full mx-auto mb-1"
            />
            <span className="text-xs text-yellow-500">{region}</span>
          </motion.div>
        ))}
      </div>
      <div className="text-xs text-gray-500/80 text-center">
        <Clock className="w-3 h-3 inline mr-1" />
        ~50ms latency
      </div>
    </div>
  );

  const CreativeDemo = () => (
    <div className="grid grid-cols-2 gap-2">
      {[
        { icon: ImageIcon, label: "Art", color: "from-pink-500 to-red-500" },
        { icon: Video, label: "Video", color: "from-purple-500 to-blue-500" },
        { icon: Music, label: "Music", color: "from-green-500 to-teal-500" },
        {
          icon: Sparkles,
          label: "Magic",
          color: "from-yellow-500 to-orange-500",
        },
      ].map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, rotate: -5 }}
          whileInView={{ opacity: 1, rotate: 0 }}
          transition={{ delay: idx * 0.1 + 0.3 }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          className={`p-2 bg-gradient-to-br ${item.color} rounded-lg text-center cursor-pointer`}
        >
          <item.icon className="w-4 h-4 text-white mx-auto mb-1" />
          <span className="text-xs text-white">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );

  const VoiceDemo = () => (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50/50 rounded-lg p-3 border border-indigo-500/30"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-indigo-500">Voice Cloning</div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-indigo-500 rounded-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-indigo-500" />
          <motion.div
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex-1 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          />
        </div>
      </motion.div>
      <div className="text-xs text-gray-500/80">
        29 languages • Human-like quality
      </div>
    </div>
  );

  return (
    <section
      id="providers"
      className="relative py-32 px-6 border-t border/10 shadow-xl shadow-purple-500/25 overflow-hidden"
    >
      {/* Enhanced Provider Ecosystem Background System */}
      <div className="absolute inset-0">
        {/* Base gradient with ecosystem theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-emerald-50/20 to-violet-50/30" />

        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(16, 185, 129, 0.2) 50%, transparent 100%)",
            boxShadow: "0 0 140px rgba(139, 92, 246, 0.3)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
        />

        {/* AI model classification pattern */}
        <motion.div
          className="absolute inset-0 opacity-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 8, delay: 6 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                radial-gradient(circle at 75% 25%, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </motion.div>

        {/* Provider capability scanner */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(16, 185, 129, 0.1) 45deg, transparent 90deg, rgba(139, 92, 246, 0.1) 135deg, transparent 180deg, rgba(6, 182, 212, 0.1) 225deg, transparent 270deg, rgba(236, 72, 153, 0.1) 315deg, transparent 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Model performance grid overlay */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 10, delay: 0 }}
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            mask: "radial-gradient(circle at center, gray 60%, transparent 100%)",
          }}
        />

        {/* AI ecosystem pulse wave */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, transparent 30%, rgba(16, 185, 129, 0.1) 40%, transparent 50%)",
          }}
          animate={{
            scale: [1, 3, 1],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 mb-8 text-sm border border-purple-500/20 rounded-full bg-purple-500/10 backdrop-blur-sm"
          >
            <Globe className="w-4 h-4 mr-2 text-purple-500/80" />
            <span className="text-purple-500/80">Global AI Ecosystem</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-primary to-muted-foreground/50 bg-clip-text text-transparent">
              One sandbox,
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              every AI powerhouse
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto"
          >
            From OpenAI's reasoning to Claude's massive context, from Google's
            multimodal understanding to Cloudflare's edge deployment - harness
            the unique strengths of every major AI provider
          </motion.p>
        </motion.div>

        {/* Enhanced provider grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {providers.map((provider, index) => {
            const Icon = provider.icon;

            return (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                onHoverStart={() => setActiveProvider(provider.name)}
                onHoverEnd={() => setActiveProvider(null)}
                className="group relative bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm shadow-gray-50/50 hover:border-white/20 transition-all overflow-hidden cursor-pointer"
              >
                {/* Enhanced gradient overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                  className={`absolute inset-0 bg-gradient-to-br ${provider.color} rounded-2xl transition-opacity`}
                />

                {/* Floating particles specific to each provider */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5,
                  }}
                  className="absolute top-4 right-4 w-2 h-2 bg-white/50 rounded-full blur-sm"
                />

                <div className="relative z-10">
                  {/* Provider header */}
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${provider.color} shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white/80" />
                    </motion.div>

                    <motion.div
                      animate={
                        activeProvider === provider.name
                          ? { scale: [1, 1.2, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-500 font-medium">
                        LIVE
                      </span>
                    </motion.div>
                  </div>

                  {/* Provider name and specialty */}
                  <h3
                    className={`text-2xl font-bold mb-2 bg-gradient-to-r ${provider.color} bg-clip-text text-transparent`}
                  >
                    {provider.name}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {provider.specialty}
                  </p>

                  {/* Context size badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="inline-flex items-center px-3 py-1 mb-4 text-xs rounded-full text-gray-500 backdrop-blur-sm border border-gray-200/50 shadow-sm shadow-gray-50/50"
                  >
                    <Database className="w-3 h-3 mr-1" />
                    {provider.contextSize}
                  </motion.div>

                  {/* Capability bars */}
                  <div className="space-y-3 mb-6">
                    {provider.capabilities.map((capability, idx) => (
                      <motion.div
                        key={capability.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 + index * 0.1 + 0.7 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <capability.icon className="w-4 h-4 text-gray-500/80" />
                          <span className="text-xs text-gray-500/80">
                            {capability.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{
                                width: `${capability.strength}%`,
                              }}
                              transition={{
                                duration: 1.5,
                                delay: idx * 0.1 + index * 0.1 + 0.8,
                              }}
                              className={`h-full bg-gradient-to-r ${provider.color} rounded-full`}
                            />
                          </div>
                          <span className="text-xs text-gray-500/80 w-8">
                            {capability.strength}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Interactive demos */}
                  {provider.demo === "reasoning" && <ReasoningDemo />}
                  {provider.demo === "analysis" && <AnalysisDemo />}
                  {provider.demo === "multimodal" && <MultimodalDemo />}
                  {provider.demo === "edge" && <EdgeDemo />}
                  {provider.demo === "creative" && <CreativeDemo />}
                  {provider.demo === "voice" && <VoiceDemo />}

                  {/* Model list - condensed */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 1.2 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="flex flex-wrap gap-1">
                      {provider.models.slice(0, 3).map((model) => (
                        <span
                          key={model}
                          className="text-xs text-gray-500/80 bg-gray-500/10 px-2 py-1 rounded"
                        >
                          {model}
                        </span>
                      ))}
                      {provider.models.length > 3 && (
                        <span className="text-xs bg-gray-500/10 px-2 py-1 rounded text-gray-500/80">
                          +{provider.models.length - 3} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Corner accent with provider-specific animation */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                  animate={
                    activeProvider === provider.name
                      ? { rotate: 360 }
                      : { rotate: 0 }
                  }
                  className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-br ${provider.color} rounded-full shadow-lg`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Unified interface demonstration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative bg-gray-50/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-sm shadow-gray-50/50 p-8 mb-16 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold mb-4"
              >
                <span className="bg-gradient-to-r from-primary to-muted-foreground/50 bg-clip-text text-transparent">
                  Switch between any model
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  with a single click
                </span>
              </motion.h3>
              <p className="text-gray-500/80 max-w-2xl mx-auto">
                The same conversation, different AI minds. Compare responses,
                find the perfect model for each task, or combine them for
                ultimate flexibility.
              </p>
            </div>

            {/* Model switcher demo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {providers.slice(0, 3).map((provider, idx) => (
                <motion.div
                  key={provider.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.2 + 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50/50 rounded-xl p-4 border border-gray-700/50 cursor-pointer hover:border-gray-600/50 transition-all"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${provider.color}`}
                    >
                      <provider.icon className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500/80">
                        {provider.name}
                      </div>
                      <div className="text-xs text-gray-500/80">
                        {provider.models[0]}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: idx * 0.3 + 1 }}
                    className="h-20 bg-gray-50/50 rounded-lg p-3 border border-gray-700/30 overflow-y-hidden"
                  >
                    <div className="text-xs text-gray-500/80 leading-relaxed">
                      {idx === 0 &&
                        "The key to OAuth is understanding the authorization flow..."}
                      {idx === 1 &&
                        "Let me break down OAuth implementation step by step..."}
                      {idx === 2 &&
                        "Here's a comprehensive OAuth guide with code examples..."}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Compatibility section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-500/80 mb-6">
            Plus seamless integration with MCP protocol for unlimited
            extensibility
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "LangChain",
              "LlamaIndex",
              "Vercel AI SDK",
              "OpenAI SDK",
              "Anthropic SDK",
            ].map((framework, idx) => (
              <motion.div
                key={framework}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.6 }}
                className="inline-flex items-center px-4 py-2 bg-gray-50/50 backdrop-blur-sm border border-gray-200 rounded-full hover:border-gray-500/20 transition-all"
              >
                <span className="text-sm text-gray-500/80">{framework}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          {/* replace with a 21st.dev */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 space-y-10"
          >
            <div className="relative w-fit mx-auto z-10">
              <GlowEffect
                colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
                mode="static"
                blur="strongest"
              />
              <InteractiveHoverButton
                text="Start with any model"
                className=""
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-gray-500/80 text-sm mt-4 opacity-80"
            >
              Free tier includes access to multiple providers
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewProviders;
