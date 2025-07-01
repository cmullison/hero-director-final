import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Brain,
  Zap,
  CheckCircle,
  Clock,
  FileText,
  Database,
  GitBranch,
  Terminal,
  Cpu,
} from "lucide-react";
import { RainbowButton } from "../ui/rainbow-button";
import { GlowEffect } from "../glow-effect";
import { InteractiveHoverButton } from "./interactive-hover-button";

const NewHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 sm:px-6 sm:pt-28 pb-20 overflow-hidden shadow-xl shadow-purple-500/25">
      {/* Enhanced Multi-layered Background System */}
      <div className="absolute top-0 bottom-0 left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-[100vw]">
        {/* Base gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20" />

        {/* Animated synthwave grid */}
        {/* <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <motion.path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="url(#gridGradient)"
                  strokeWidth="0.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, delay: 0.5 }}
                />
              </pattern>
              <linearGradient
                id="gridGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#EC4899" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </motion.div> */}

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
                id="circuit"
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
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </motion.div>

        {/* Geometric shapes layer */}
        <div className="absolute inset-0">
          {/* Small circles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + (i % 4) * 25}%`,
                top: `${30 + Math.floor(i / 4) * 40}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <div
                className="w-3 h-3 rounded-full border border-purple-400/30 bg-purple-400/10"
                style={{
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Scan line effect */}
        {/* <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
            width: "200%",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        /> */}

        {/* Enhanced floating orbs with neon glow */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 100%)",
            boxShadow: "0 0 100px rgba(139, 92, 246, 0.3)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(16, 185, 129, 0.2) 50%, transparent 100%)",
            boxShadow: "0 0 100px rgba(59, 130, 246, 0.3)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Enhanced floating particles with trails */}
        <motion.div
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4"
        >
          <div className="relative">
            <div
              className="w-4 h-4 bg-purple-400 rounded-full blur-sm"
              style={{ boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)" }}
            />
            <motion.div
              className="absolute inset-0 w-4 h-4 bg-purple-400 rounded-full"
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 120, 0],
            x: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-3/4 right-1/3"
        >
          <div className="relative">
            <div
              className="w-3 h-3 bg-pink-400 rounded-full blur-sm"
              style={{ boxShadow: "0 0 15px rgba(236, 72, 153, 0.6)" }}
            />
            <motion.div
              className="absolute inset-0 w-3 h-3 bg-pink-400 rounded-full"
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -80, 0],
            x: [0, -40, 0],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-1/3 left-1/6"
        >
          <div className="relative">
            <div
              className="w-2 h-2 bg-blue-400 rounded-full blur-sm"
              style={{ boxShadow: "0 0 12px rgba(59, 130, 246, 0.6)" }}
            />
            <motion.div
              className="absolute inset-0 w-2 h-2 bg-blue-400 rounded-full"
              animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:inline-flex items-center px-3 py-1 mb-6 md:mb-8 text-xs border-purple-500/20 rounded-full bg-purple-500/10 backdrop-blur-sm"
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-500" />
          <span className="text-purple-500">
            <span className="hidden sm:inline">Multi-provider AI Sandbox</span>
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8"
        >
          <span className="bg-gradient-to-r from-indigo-700 to-amber-900/50 bg-clip-text text-transparent">
            The ultimate sandbox
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            for AI agents
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-700/80 max-w-3xl mx-auto mb-10 sm:mb-14 px-4"
        >
          Test and develop agents from any provider. Connect MCP servers,
          generate media, and access every major AI model in one place.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 mb-16 sm:mb-20"
        >
          <RainbowButton className="w-64 sm:w-auto">
            Start building for free
          </RainbowButton>
          <InteractiveHoverButton
            text="View live demo"
            className="w-64 pl-4 pr-4 sm:w-56"
          />
        </motion.div>

        {/* Animated UI preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10 overflow-hidden rounded-xl" />

          {/* Main interface */}
          <GlowEffect
            colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
            mode="colorShift"
            blur="medium"
          />
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-gray-50/90 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="border-b border-white/10 p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  <span className="hidden sm:inline">AI Agent Sandbox</span>
                  <span className="sm:hidden">Sandbox</span>
                </span>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-1 sm:space-x-2 text-green-500"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
                <span className="text-xs">ACTIVE</span>
              </motion.div>
            </div>

            <div className="p-4 sm:p-8">
              {/* Agent conversation */}
              <div className="space-y-4 sm:space-y-6">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="flex items-start space-x-2 sm:space-x-4"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      U
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-50/50 rounded-lg p-3 sm:p-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, delay: 1.2 }}
                      className="text-gray-500 overflow-hidden whitespace-nowrap text-sm sm:text-base"
                    >
                      <span className="hidden sm:inline">
                        Create a full-stack React app with authentication and a
                        database
                      </span>
                      <span className="sm:hidden">
                        Create a React app with auth
                      </span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* AI response with enhanced typing effect */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                  className="flex items-start space-x-2 sm:space-x-4"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </motion.div>
                  </div>
                  <div className="flex-1 space-y-3 sm:space-y-4">
                    <div className="bg-gray-50/50 rounded-lg p-3 sm:p-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, delay: 2 }}
                        className="text-gray-500 overflow-hidden whitespace-nowrap text-sm sm:text-base"
                      >
                        <span className="hidden sm:inline">
                          I'll create a comprehensive full-stack application for
                          you. Let me break this down into components...
                        </span>
                        <span className="sm:hidden">
                          I'll create a full-stack app for you...
                        </span>
                      </motion.div>
                    </div>

                    {/* Multiple code blocks showing progression */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 3 }}
                      className="bg-gray-50/50 rounded-lg p-3 sm:p-4 border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-xs text-purple-500 font-mono">
                          auth/login.tsx
                        </span>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 3.5 }}
                          className="flex items-center space-x-1 sm:space-x-2 text-yellow-500"
                        >
                          <Cpu className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                          <span className="text-xs">
                            <span className="hidden sm:inline">
                              Generating...
                            </span>
                            <span className="sm:hidden">Gen...</span>
                          </span>
                        </motion.div>
                      </div>
                      <div className="font-mono text-xs sm:text-sm space-y-1">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 3.2 }}
                          className="text-blue-500"
                        >
                          import React from 'react';
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 3.4 }}
                          className="text-purple-500"
                        >
                          import {"{"} useAuth {"}"} from './hooks';
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 3.6 }}
                          className="text-gray-500"
                        >
                          // Authentication component...
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 4.5 }}
                      className="bg-gray-50/50 rounded-lg p-3 sm:p-4 border border-green-500/20"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-xs text-green-500 font-mono">
                          database/schema.sql
                        </span>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 5 }}
                          className="flex items-center space-x-1 sm:space-x-2 text-green-500"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs">Complete</span>
                        </motion.div>
                      </div>
                      <div className="font-mono text-xs sm:text-sm space-y-1">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 4.7 }}
                          className="text-blue-500"
                        >
                          CREATE TABLE users (
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 4.9 }}
                          className="text-yellow-500 ml-2 sm:ml-4"
                        >
                          id SERIAL PRIMARY KEY,
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 5.1 }}
                          className="text-blue-500"
                        >
                          );
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Enhanced progress tracking */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 5.5 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          <span className="hidden sm:inline text-gray-600">
                            Building full-stack application...
                          </span>
                          <span className="sm:hidden">Building app...</span>
                        </span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-gray-50 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "68%" }}
                          transition={{ duration: 2.5, delay: 5.5 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full relative"
                        >
                          <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full shadow-lg"
                          />
                        </motion.div>
                      </div>

                      {/* Task breakdown */}
                      <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-3 sm:mt-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 6 }}
                          className="flex items-center space-x-1 sm:space-x-2 text-xs text-green-500"
                        >
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Auth system</span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 6.2 }}
                          className="flex items-center space-x-1 sm:space-x-2 text-xs text-green-500"
                        >
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>
                            <span className="hidden sm:inline">
                              Database setup
                            </span>
                            <span className="sm:hidden">Database</span>
                          </span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 6.4 }}
                          className="flex items-center space-x-1 sm:space-x-2 text-xs text-yellow-500"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                          >
                            <Cpu className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </motion.div>
                          <span>API routes</span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 6.6 }}
                          className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500"
                        >
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Frontend UI</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Sequential status cards that tell a story - Hidden on mobile to prevent overflow */}
          {/* Initial processing state */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -10],
              scale: [0.8, 1, 1, 0.9],
            }}
            transition={{
              duration: 4,
              times: [0, 0.3, 0.8, 1],
              delay: 5,
            }}
            className="hidden sm:block absolute -bottom-4 -left-4 z-30 bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 text-blue-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4"
              >
                <Cpu className="w-4 h-4" />
              </motion.div>
              <span className="text-xs font-medium">
                Analyzing requirements...
              </span>
            </div>
          </motion.div>

          {/* First task completion */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -10],
              scale: [0.8, 1, 1, 0.9],
            }}
            transition={{
              duration: 3,
              times: [0, 0.3, 0.8, 1],
              delay: 7,
            }}
            className="hidden sm:block absolute -bottom-4 -left-4 z-30 bg-green-500/20 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 text-green-500">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                Authentication completed
              </span>
            </div>
          </motion.div>

          {/* Second task completion */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -10],
              scale: [0.8, 1, 1, 0.9],
            }}
            transition={{
              duration: 3,
              times: [0, 0.3, 0.8, 1],
              delay: 9,
            }}
            className="hidden sm:block absolute -bottom-4 -right-4 z-30 bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 text-purple-500">
              <Database className="w-4 h-4" />
              <span className="text-xs font-medium">Database schema ready</span>
            </div>
          </motion.div>

          {/* Final processing state */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 1],
              y: [20, 0, 0, 0],
              scale: [0.8, 1, 1, 1],
            }}
            transition={{
              duration: 2,
              times: [0, 0.4, 0.8, 1],
              delay: 11,
            }}
            className="hidden sm:block absolute -bottom-4 -left-4 z-30 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 text-yellow-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4"
              >
                <GitBranch className="w-4 h-4" />
              </motion.div>
              <span className="text-xs font-medium">
                Building API routes...
              </span>
            </div>
          </motion.div>

          {/* Success state */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: [0, 1],
              y: [20, 0],
              scale: [0.8, 1],
            }}
            transition={{
              duration: 1,
              delay: 13,
            }}
            className="hidden sm:block absolute -bottom-4 -right-4 z-30 bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 text-emerald-500">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <CheckCircle className="w-4 h-4" />
              </motion.div>
              <span className="text-xs font-medium">Application deployed!</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/20 rounded-full p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-0.5 h-1.5 sm:w-1 sm:h-2 bg-white/60 rounded-full mx-auto"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default NewHero;
