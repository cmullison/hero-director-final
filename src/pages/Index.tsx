import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import NewHero from "../components/landing/NewHero";
import NewFeatures from "../components/landing/NewFeatures";
import NewShowcase from "../components/landing/NewShowcase";
import NewProviders from "../components/landing/NewProviders";
import NewCTA from "../components/landing/NewCTA";
import AnimatedGradientBackground from "../components/separator-gradient";
import { InteractiveHoverButton } from "@/components/landing/interactive-hover-button";
import { GlowEffect } from "@/components/glow-effect";
import { RainbowButton } from "@/components/ui/rainbow-button";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-4 left-2 right-2 mx-auto rounded-full border-2 border-gray-200/50 z-50 backdrop-blur-lg bg-gray-50/50 max-w-7xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden">
              <a
                href="/"
                className="w-10 h-10 flex items-center justify-center"
              >
                <img
                  src="/images/glass-m-logo.png"
                  alt="Agents.mulls Logo"
                  className="w-10 h-10 aspect-square object-contain pointer-events-auto"
                />
              </a>
            </div>
            <span className="text-xl font-bold"></span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="hover:text-purple-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#showcase"
              className="hover:text-purple-400 transition-colors"
            >
              Examples
            </a>
            <a
              href="#providers"
              className="hover:text-purple-400 transition-colors"
            >
              Providers
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              GitHub
            </a>
          </div>
          <InteractiveHoverButton
            text="Sign in"
            className="px-6 py-2 rounded-full border-2 border-border font-medium hover:shadow-lg hover:shadow-purple-500/25 hover:pl-2 hover:pr-10 transition-all"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          />
        </div>
      </motion.nav>

      {/* Main content */}
      <main>
        <NewHero />

        {/* Separator between Hero and Features */}
        <div className="relative h-16 overflow-hidden">
          <AnimatedGradientBackground
            variant="dots"
            Breathing={true}
            accentColor="#8B5CF6"
            containerClassName="opacity-80"
          />
        </div>

        <NewFeatures />

        {/* Separator between Features and Showcase */}
        <div className="relative h-12 overflow-hidden">
          <AnimatedGradientBackground
            variant="minimal"
            Breathing={true}
            accentColor="#EC4899"
            containerClassName="opacity-70"
          />
        </div>

        <NewShowcase />

        {/* Separator between Showcase and Providers */}
        <div className="relative h-14 overflow-hidden">
          <AnimatedGradientBackground
            variant="lines"
            Breathing={true}
            accentColor="#3B82F6"
            containerClassName="opacity-75"
          />
        </div>

        <NewProviders />

        {/* Separator between Providers and CTA */}
        <div className="relative h-10 overflow-hidden">
          <AnimatedGradientBackground
            variant="fade"
            Breathing={true}
            accentColor="#10B981"
            containerClassName="opacity-60"
          />
        </div>

        <NewCTA />
      </main>

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  );
};

export default Index;
