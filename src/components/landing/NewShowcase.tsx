import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Bot,
  MessageSquare,
  Code,
  Sparkles,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Terminal,
  GitBranch,
  Globe,
  Zap,
  Play,
  Monitor,
  Server,
  Image as ImageIcon,
  Video,
  Mic,
  ArrowRight,
  FileText,
  Brain,
  Code2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GlowEffect } from "../glow-effect";
import { InteractiveHoverButton } from "./interactive-hover-button";

const NewShowcase = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "mcp" | "media">("chat");
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo-preview");
  const [typingText, setTypingText] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  // Typing effect for demo
  useEffect(() => {
    let startDelay: NodeJS.Timeout | null = null;
    let typingTimer: NodeJS.Timeout | null = null;

    if (activeTab === "chat") {
      const text = "I'll explain quantum computing in simple terms...";
      let i = 0;
      setTypingText("");

      // Wait 2.5 seconds before beginning the typing effect
      startDelay = setTimeout(() => {
        typingTimer = setInterval(() => {
          if (i < text.length) {
            setTypingText(text.slice(0, i + 1));
            i++;
          } else {
            if (typingTimer) clearInterval(typingTimer);
          }
        }, 25);
      }, 4000);
    } else {
      // Immediately clear typing text when switching away from chat tab
      setTypingText("");
    }

    // Cleanup function to clear both timers
    return () => {
      if (startDelay) clearTimeout(startDelay);
      if (typingTimer) clearInterval(typingTimer);
    };
  }, [activeTab]);

  const examples = {
    chat: {
      title: "Multi-Model Chat",
      description:
        "Switch between providers seamlessly with hot-swappable models",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      code: `// Universal AI interface - switch models instantly
const models = {
  openai: new OpenAI({ apiKey: process.env.OPENAI_KEY }),
  anthropic: new Anthropic({ apiKey: process.env.ANTHROPIC_KEY }),
  google: new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_KEY })
};

// Same interface, different models
const response = await models[selectedModel].chat.completions.create({
  model: "gpt-4-turbo-preview", // or claude-3-opus, gemini-pro
  messages: [{ 
    role: "user", 
    content: "Explain quantum computing simply" 
  }],
  stream: true, // Real-time streaming
  temperature: 0.7
});

// Auto-failover and load balancing
for await (const chunk of response) {
  console.log(chunk.choices[0]?.delta?.content);
}`,
      demo: (
        <div className="space-y-6">
          {/* Enhanced model selector */}
          <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-700/50">
            <Select
              onValueChange={(value) => {
                setSelectedModel(value);
                // Trigger typing effect when model changes
                setTypingText("");
                const text = `Switching to ${value.replace("-", " ").toUpperCase()}... I'll explain quantum computing in simple terms...`;
                let i = 0;
                const timer = setInterval(() => {
                  if (i < text.length) {
                    setTypingText(text.slice(0, i + 1));
                    i++;
                  } else {
                    clearInterval(timer);
                  }
                }, 25);
              }}
              value={selectedModel}
            >
              <SelectTrigger className="bg-gradient-to-r from-gray-50 to-gray-200 text-sm px-4 py-2 rounded-xl border border-gray-600/50 hover:border-blue-500/50 transition-all shadow-sm shadow-gray-50/50 backdrop-blur-sm">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-turbo-preview">
                  GPT-4 Turbo (32k context)
                </SelectItem>
                <SelectItem value="claude-3-opus">
                  Claude 3.5 Sonnet (200k context)
                </SelectItem>
                <SelectItem value="gemini-pro">
                  Gemini Pro (1M context)
                </SelectItem>
                <SelectItem value="llama-2">Llama 2 (4k context)</SelectItem>
              </SelectContent>
            </Select>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </motion.div>
          </div>

          {/* Performance metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(() => {
              const metrics: Record<
                string,
                Array<{ label: string; value: string; color: string }>
              > = {
                "gpt-4-turbo-preview": [
                  { label: "Latency", value: "180ms", color: "green" },
                  { label: "Tokens/s", value: "47", color: "blue" },
                  { label: "Cost", value: "$0.003", color: "purple" },
                ],
                "claude-3-opus": [
                  { label: "Latency", value: "120ms", color: "green" },
                  { label: "Tokens/s", value: "62", color: "blue" },
                  { label: "Cost", value: "$0.015", color: "purple" },
                ],
                "gemini-pro": [
                  { label: "Latency", value: "95ms", color: "green" },
                  { label: "Tokens/s", value: "89", color: "blue" },
                  { label: "Cost", value: "$0.001", color: "purple" },
                ],
                "llama-2": [
                  { label: "Latency", value: "340ms", color: "green" },
                  { label: "Tokens/s", value: "23", color: "blue" },
                  { label: "Cost", value: "$0.0005", color: "purple" },
                ],
              };
              return metrics[selectedModel] || metrics["gpt-4-turbo-preview"];
            })().map(
              (
                metric: { label: string; value: string; color: string },
                idx: number
              ) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.5 }}
                  className="bg-gray-50/50 rounded-lg p-3 border border-gray-700/50"
                >
                  <div className="text-xs text-gray-400 mb-1">
                    {metric.label}
                  </div>
                  <div className={`text-sm font-bold text-${metric.color}-400`}>
                    {metric.value}
                  </div>
                </motion.div>
              )
            )}
          </div>

          {/* Enhanced chat interface */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start space-x-3"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm shadow-gray-50/50"
              >
                <span className="text-xs font-bold text-white">U</span>
              </motion.div>
              <div className="flex-1 bg-gradient-to-r from-gray-50/80 to-gray-50/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-700/50">
                <motion.p
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 2.5 }}
                  className="text-sm text-gray-500/80"
                >
                  Explain quantum computing in simple terms
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-start space-x-3"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm shadow-gray-50/50"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
              <div className="flex-1 bg-gradient-to-r from-gray-50/80 to-gray-50/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-700/50">
                <motion.p
                  className="text-sm text-gray-500/80 min-h-[1.25rem]"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  {typingText}
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 1.5 }}
                    className="ml-1"
                  >
                    |
                  </motion.span>
                </motion.p>
              </div>
            </motion.div>

            {/* Streaming indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center justify-center space-x-2 text-xs text-gray-500"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
              <span>Streaming response in real-time</span>
            </motion.div>
          </div>
        </div>
      ),
    },
    mcp: {
      title: "MCP Server Connection",
      description:
        "Connect to remote Model Context Protocol servers for extended capabilities",
      color: "orange",
      gradient: "from-orange-500 to-red-500",
      code: `// Connect to multiple MCP servers
const mcpServers = await Promise.all([
  new MCPClient({ url: 'wss://research.mcp.io', tools: ['search', 'arxiv'] }),
  new MCPClient({ url: 'wss://data.mcp.io', tools: ['sql', 'analytics'] }),
  new MCPClient({ url: 'wss://code.mcp.io', tools: ['github', 'deploy'] })
]);

// Discover available tools across all servers
const allTools = await Promise.all(
  mcpServers.map(server => server.listTools())
);

// Execute distributed operations
const results = await Promise.all([
  mcpServers[0].callTool('search', { 
    query: 'latest transformer architectures',
    sources: ['arxiv', 'google-scholar']
  }),
  mcpServers[1].callTool('sql', {
    query: 'SELECT * FROM user_metrics WHERE date > NOW() - INTERVAL 7 DAY'
  }),
  mcpServers[2].callTool('deploy', {
    repo: 'my-ai-app',
    environment: 'production'
  })
]);`,
      demo: (
        <div className="space-y-6">
          {/* Server status grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                name: "Research Server",
                status: "connected",
                tools: 8,
                latency: "45ms",
              },
              {
                name: "Data Server",
                status: "connected",
                tools: 12,
                latency: "32ms",
              },
              {
                name: "Code Server",
                status: "connecting",
                tools: 6,
                latency: "---",
              },
              {
                name: "Media Server",
                status: "error",
                tools: 0,
                latency: "---",
              },
            ].map((server, idx) => (
              <motion.div
                key={server.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.2 + 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{server.name}</span>
                  <motion.div
                    animate={
                      server.status === "connecting" ? { rotate: 360 } : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className={`w-3 h-3 rounded-full ${
                      server.status === "connected"
                        ? "bg-green-500"
                        : server.status === "connecting"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Tools</span>
                    <span className="text-gray-400">{server.tools}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Latency</span>
                    <span className="text-gray-400">{server.latency}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live activity feed */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-50/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="w-4 h-4 text-orange-400" />
              </motion.div>
              <span className="text-sm font-medium">Live Activity</span>
            </div>
            <div className="space-y-3">
              {[
                {
                  time: "2s ago",
                  action: "Tool called: web_search",
                  server: "Research",
                },
                {
                  time: "5s ago",
                  action: "Context updated: user_prefs",
                  server: "Data",
                },
                {
                  time: "12s ago",
                  action: "Resource accessed: knowledge_base",
                  server: "Research",
                },
                {
                  time: "18s ago",
                  action: "Deployment started: staging",
                  server: "Code",
                },
              ].map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 1 }}
                  className="flex items-center space-x-3 text-xs"
                >
                  <span className="text-gray-500 w-12">{activity.time}</span>
                  <div className="flex-1 text-gray-400">{activity.action}</div>
                  <span className="text-orange-500 text-xs bg-orange-500/10 px-2 py-1 rounded-full">
                    {activity.server}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Network topology visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="relative h-20 bg-gray-50/30 rounded-xl p-4 border border-gray-700/50 overflow-hidden"
          >
            <motion.div
              animate={{ x: [0, 200, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-0 w-2 h-2 bg-orange-500 rounded-full blur-sm"
            />
            <motion.div
              animate={{ x: [200, 0, 200] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-1/2 right-0 w-2 h-2 bg-blue-500 rounded-full blur-sm"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-500">
                MCP Protocol Data Flow
              </span>
            </div>
          </motion.div>
        </div>
      ),
    },
    media: {
      title: "Media Generation Pipeline",
      description:
        "Generate images, videos, and audio with multiple AI providers",
      color: "pink",
      gradient: "from-pink-500 to-purple-500",
      code: `// Multi-modal media generation pipeline
const mediaGeneration = {
  // Image generation with multiple providers
  async generateImage(prompt, style = "photorealistic") {
    const providers = [
      { name: "DALL-E 3", endpoint: openai.images.generate },
      { name: "Midjourney", endpoint: replicate.run("midjourney/midjourney") },
      { name: "SDXL", endpoint: replicate.run("stability-ai/sdxl") }
    ];
    
    return await Promise.allSettled(
      providers.map(p => p.endpoint({
        prompt: \`\${prompt}, \${style} style\`,
        size: "1024x1024",
        quality: "hd"
      }))
    );
  },

  // Video generation from prompts
  async generateVideo(prompt, duration = 5) {
    return await replicate.run("meta/emu-video", {
      prompt,
      duration_seconds: duration,
      fps: 30,
      resolution: "1280x720"
    });
  },

  // Text-to-speech with voice cloning
  async synthesizeSpeech(text, voice = "rachel") {
    return await elevenlabs.textToSpeech({
      text,
      voice_id: voice,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.75, similarity_boost: 0.85 }
    });
  }
};`,
      demo: (
        <div className="space-y-6">
          {/* Generation pipeline status */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
              </motion.div>
              <span className="text-sm font-medium">Generation Pipeline</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="ml-auto px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full border border-green-500/30"
              >
                ACTIVE
              </motion.div>
            </div>

            {/* Media type grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: ImageIcon,
                  label: "Images",
                  color: "from-pink-500 to-red-500",
                  status: "completed",
                  count: "4 generated",
                },
                {
                  icon: Video,
                  label: "Videos",
                  color: "from-blue-500 to-purple-500",
                  status: "processing",
                  count: "2 queued",
                },
                {
                  icon: Mic,
                  label: "Speech",
                  color: "from-green-500 to-teal-500",
                  status: "ready",
                  count: "1 pending",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.2 + 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`relative p-4 bg-gradient-to-br ${item.color} rounded-xl text-center cursor-pointer shadow-sm shadow-gray-50/50 overflow-hidden`}
                >
                  {/* Background pattern */}
                  <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                  />

                  <div className="relative z-10">
                    <motion.div
                      animate={
                        item.status === "processing" ? { rotate: 360 } : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <item.icon className="w-6 h-6 text-white mx-auto mb-2" />
                    </motion.div>
                    <span className="text-sm text-white font-medium block mb-1">
                      {item.label}
                    </span>
                    <span className="text-xs text-white/80">{item.count}</span>

                    {/* Status indicator */}
                    <motion.div
                      animate={
                        item.status === "processing"
                          ? { scale: [1, 1.2, 1] }
                          : {}
                      }
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        item.status === "completed"
                          ? "bg-green-400"
                          : item.status === "processing"
                            ? "bg-yellow-400"
                            : "bg-gray-400"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Real-time generation progress */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            {/* Currently generating */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm">
                  Generating: "Futuristic cityscape at sunset"
                </span>
                <span className="text-xs text-gray-500">DALL-E 3</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "73%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full relative"
                >
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute right-0 top-0 w-2 h-2 rounded-full shadow-sm shadow-gray-50/50"
                  />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>73% complete</span>
                <span>ETA: 12s</span>
              </div>
            </div>

            {/* Queue */}
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Queue (2 pending)</span>
              {[
                {
                  prompt: "Abstract art with vibrant colors",
                  provider: "Midjourney",
                  type: "image",
                },
                {
                  prompt: "Robot dancing in neon lights",
                  provider: "Emu Video",
                  type: "video",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 1.2 }}
                  className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-700/30"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: idx * 0.5,
                      }}
                      className="w-2 h-2 bg-yellow-500 rounded-full"
                    />
                    <span className="text-xs text-gray-400 max-w-[200px] truncate">
                      {item.prompt}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {item.provider}
                    </span>
                    <div
                      className={`w-1 h-1 rounded-full ${item.type === "image" ? "bg-pink-500" : "bg-blue-500"}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ),
    },
  };

  return (
    <section
      id="showcase"
      className="relative py-32 px-6 overflow-hidden border-t border/10 shadow-xl shadow-purple-500/25"
    >
      {/* Enhanced Network-themed Background System */}
      <div className="absolute inset-0">
        {/* Base gradient with network theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/20" />

        {/* Animated network grid */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 4 }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="networkGrid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <motion.path
                  d="M10,0 L10,20 M0,10 L20,10"
                  stroke="url(#connectionGradient)"
                  strokeWidth="0.1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 3, delay: 1 }}
                />
              </pattern>
              <linearGradient id="nodeGradient">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient
                id="connectionGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#networkGrid)" />
          </svg>
        </motion.div>

        {/* Perspective grid overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            transform: "perspective(1000px) rotateX(45deg) translateZ(-200px)",
          }}
          initial={{ opacity: 0 }}
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
        {/*         <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 4, delay: 2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 400 400">
            <defs>
              <pattern
                id="circuit"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <g stroke="#8B5CF6" strokeWidth="0.25" fill="none">
                  <circle cx="20" cy="20" r="0.1" fill="#8B5CF6" />
                  <path d="M20,0 L20,20 M0,20 L20,20 M20,20 L40,20 M20,20 L20,40" />
                  <circle cx="0" cy="20" r="0.05" fill="#EC4899" />
                  <circle cx="40" cy="20" r="0.05" fill="#EC4899" />
                  <circle cx="20" cy="0" r="0.05" fill="#3B82F6" />
                  <circle cx="20" cy="40" r="0.05" fill="#3B82F6" />
                </g>
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#circuit)" />
          </svg>
        </motion.div> */}

        {/* Network nodes with data pulses */}
        <div className="absolute inset-0">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + (i % 4) * 20}%`,
                top: `${15 + Math.floor(i / 4) * 20}%`,
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 3 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <div className="relative">
                {/* Data pulse indicators */}
                {i % 3 === 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    style={{ boxShadow: "0 0 10px rgba(139, 92, 246, 0.8)" }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating interface elements */}

        {/* Enhanced floating orbs with network glow */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)",
            boxShadow: "0 0 120px rgba(6, 182, 212, 0.3)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 100%)",
            boxShadow: "0 0 120px rgba(139, 92, 246, 0.3)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        {/* Data packet visualization */}
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 6, delay: 4 }}
        >
          {/* <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 8px,
                  rgba(6, 182, 212, 0.1) 8px,
                  rgba(6, 182, 212, 0.1) 16px
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 8px,
                  rgba(139, 92, 246, 0.1) 8px,
                  rgba(139, 92, 246, 0.1) 16px
                )
              `,
            }}
          /> */}
        </motion.div>

        {/* Network activity scanner */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(6, 182, 212, 0.1) 50%, transparent 70%)",
            width: "150%",
          }}
          animate={{ x: ["-50%", "100%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Quantum interference patterns */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-full h-64"
          style={{ transform: "translate(-50%, -50%)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <svg width="256" height="256" viewBox="0 0 256 256">
            <defs>
              <radialGradient id="interferenceGradient">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i}
                cx="128"
                cy="128"
                r={30 + i * 25}
                fill="none"
                stroke="url(#interferenceGradient)"
                strokeWidth="1"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 30 + i * 25, opacity: [0, 0.3, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </svg>
        </motion.div>
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
            <Play className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-purple-500">Live Demonstrations</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-primary to-muted-foreground/50 bg-clip-text text-transparent">
              See it in action
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Everything works together
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto"
          >
            Watch our integrated tools create powerful workflows in real-time
          </motion.p>
        </motion.div>

        {/* Enhanced tab navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {Object.entries(examples).map(([key, example]) => (
            <motion.button
              key={key}
              onClick={() => setActiveTab(key as "chat" | "mcp" | "media")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative px-8 py-4 rounded-2xl font-medium transition-all ${
                activeTab === key
                  ? ` text-white`
                  : "bg-gray-50/50 text-gray-500 hover:text-white hover:bg-gray-200/50 border border-gray-700/50"
              }`}
            >
              {/* Active tab glow effect */}
              {activeTab === key && (
                <>
                  <GlowEffect
                    colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
                    mode="static"
                    blur="medium"
                    style={{ zIndex: -2 }}
                  />
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-2xl bg-gray-50/90`}
                    style={{ zIndex: -1 }}
                  />
                </>
              )}

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  {activeTab === key && (
                    <>
                      <span className="text-lg bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent">
                        {example.title}
                      </span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-primary/90 rounded-full"
                      />
                    </>
                  )}
                  {activeTab !== key && (
                    <span className="text-lg text-primary">
                      {example.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm mt-1">
                {activeTab === key && (
                  <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                    {example.description}
                  </span>
                )}
                {activeTab !== key && (
                  <span className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 bg-clip-text text-transparent">
                    {example.description}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Enhanced content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Enhanced code block */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative bg-gray-50/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Code header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gray-500/50">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-gray-500 font-mono">
                    agent.js
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-primary-foreground/90 hover:text-primary-foreground/100 transition-colors px-3 py-1 bg-gray-700/50 rounded-lg border border-gray-600/50"
                >
                  Copy code
                </motion.button>
              </div>

              {/* Enhanced code content */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full"
                >
                  <pre
                    className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded-b-3xl overflow-auto h-96"
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    }}
                  >
                    <code>{examples[activeTab].code}</code>
                  </pre>
                </motion.div>

                {/* Code execution indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute bottom-4 right-4 flex items-center space-x-2 bg-gray-800/80 px-3 py-2 rounded-lg border border-gray-700/50 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-3 h-3"
                  >
                    <Cpu className="w-3 h-3 text-green-400" />
                  </motion.div>
                  <span className="text-xs text-green-400 font-medium">
                    Executing...
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced demo area */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative bg-gray-50/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              {/* Demo header */}
              <div className="mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center space-x-3 mb-4"
                >
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${examples[activeTab].gradient} shadow-sm shadow-gray-50/50`}
                  >
                    {activeTab === "chat" && (
                      <MessageSquare className="w-5 h-5 text-primary-foreground" />
                    )}
                    {activeTab === "mcp" && (
                      <Globe className="w-5 h-5 text-primary-foreground" />
                    )}
                    {activeTab === "media" && (
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-600">
                      {examples[activeTab].title}
                    </h3>
                    <p className="text-sm text-gray-500/80">
                      {examples[activeTab].description}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Demo content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {examples[activeTab].demo}
              </motion.div>

              {/* Corner accent */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-br ${examples[activeTab].gradient} rounded-full shadow-sm shadow-gray-50/50`}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA section */}
        {/* Replace button with 21st.dev button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-10"
          >
            <div className="relative w-fit mx-auto z-10">
              <GlowEffect
                colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
                mode="static"
                blur="strongest"
              />
              <InteractiveHoverButton
                text="Try the full experience"
                className=""
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-gray-500 text-sm opacity-80"
            >
              No setup required • Start building in seconds
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewShowcase;
