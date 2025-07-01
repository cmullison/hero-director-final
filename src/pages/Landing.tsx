import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll } from "framer-motion";

import Header from "@/components/ui/landing/Header";
import Hero from "@/components/ui/landing/Hero";
import Features from "@/components/ui/landing/Features";
import Examples from "@/components/ui/landing/Examples";
import Patterns from "@/components/ui/landing/Patterns";
import Footer from "@/components/ui/landing/Footer";

function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrollPosition(scrollY);

      // Header height offset
      const headerHeight = 64; // 16 * 4 = 64px

      // Section boundaries with better spacing and earlier triggers
      const heroEnd = viewportHeight * 0.6; // Hero is now shorter
      const featuresEnd = heroEnd + viewportHeight * 3; // More space for features
      const examplesEnd = featuresEnd + viewportHeight * 3; // More space for examples
      const patternsEnd = examplesEnd + viewportHeight * 2.5; // More space for patterns

      if (scrollY < heroEnd) {
        setActiveSection("hero");
      } else if (scrollY < featuresEnd) {
        setActiveSection("features");
      } else if (scrollY < examplesEnd) {
        setActiveSection("examples");
      } else if (scrollY < patternsEnd) {
        setActiveSection("patterns");
      } else {
        setActiveSection("footer");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewportHeight]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background dot pattern */}
      <div className="fixed inset-0 dot-pattern-bg pointer-events-none" />

      {/* Main content container with borders */}
      <div className="relative mx-auto max-w-[1440px] min-h-screen bg-white">
        {/* Left and right solid borders */}
        <div className="absolute top-0 left-0 bottom-0 border-b-2 border-dashed w-16 h-16 -ml-16 border-gray-200" />
        <div className="absolute top-0 left-0 bottom-0 border-l border-gray-300" />
        <div className="absolute top-0 right-0 bottom-0 border-b-2 border-dashed w-16 h-16 -mr-16 border-gray-200" />
        <div className="absolute top-0 right-0 bottom-0 border-r border-gray-300" />

        {/* Top dashed border */}
        <div className="absolute top-0 left-0 right-0 h-16 border-b-2 border-b-gray-300 border-l-1 border-l-gray-300 border-r-1 border-dashed border-r-gray-300 border-gray-300" />

        <Header activeSection={activeSection} />
        <main ref={containerRef}>
          <Hero />
          <Features
            scrollPosition={scrollPosition}
            viewportHeight={viewportHeight}
          />
          <Examples
            scrollPosition={scrollPosition}
            viewportHeight={viewportHeight}
          />
          <Patterns
            scrollPosition={scrollPosition}
            viewportHeight={viewportHeight}
          />
        </main>
        <Footer />

        {/* Bottom dashed border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 border-b-2 border-dashed border-gray-400" />
      </div>
    </div>
  );
}

export default App;
