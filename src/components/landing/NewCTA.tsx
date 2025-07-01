import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { InteractiveHoverButton } from "./interactive-hover-button";
import { RainbowButton } from "../ui/rainbow-button";

const NewCTA = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-purple-700/50 to-pink-700/50 backdrop-blur-xl rounded-3xl p-12 md:p-20 border border-white/10 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Start building with every AI
            </span>
          </h2>

          <p className="text-xl text-secondary-foreground mb-12 max-w-3xl mx-auto">
            Access OpenAI, Anthropic, Google, and Cloudflare APIs in one unified
            platform. No more juggling API keys or learning different SDKs.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
            <RainbowButton className="w-64">Launch sandbox</RainbowButton>
            <InteractiveHoverButton
              text="View documentation"
              className="w-64 -pl-4 pr-4"
              onClick={() => {
                window.open("https://docs.agents.dev", "_blank");
              }}
            />
          </div>

          {/* Features list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-secondary">
              <Check className="w-5 h-5 text-green-400" />
              <span>All providers included</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-secondary">
              <Check className="w-5 h-5 text-green-400" />
              <span>MCP protocol support</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-secondary">
              <Check className="w-5 h-5 text-green-400" />
              <span>Media generation APIs</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-32 text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
            <span className="text-xl font-bold">Agents</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-8 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Blog
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Discord
            </a>
          </div>

          <p className="text-gray-500 text-sm">
            © 2024 Agents. All rights reserved.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default NewCTA;
