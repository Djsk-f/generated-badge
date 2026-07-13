"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{ background: "var(--gradient-primary)" }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.05]"
        style={{ background: "var(--gradient-cool)" }}
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 right-[15%] w-3 h-3 rounded-full bg-indigo-400/20"
        animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 left-[10%] w-2 h-2 rounded-full bg-purple-400/20"
        animate={{ y: [0, -15, 0], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-32 right-[25%] w-4 h-4 rounded-sm bg-pink-400/10 rotate-45"
        animate={{ y: [0, -25, 0], rotate: [45, 90, 45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute top-[60%] left-[20%] w-2.5 h-2.5 rounded-full bg-indigo-300/15"
        animate={{ y: [0, -18, 0], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-[30%] right-[8%] w-5 h-5 border border-indigo-300/10 rounded-lg rotate-12"
        animate={{ y: [0, -12, 0], rotate: [12, 30, 12] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Dotted arc */}
      <svg className="absolute top-10 right-[5%] w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200">
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="text-indigo-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </svg>

      {/* Cross marks */}
      <svg className="absolute bottom-20 left-[8%] w-8 h-8 opacity-[0.08]" viewBox="0 0 24 24">
        <motion.line
          x1="12" y1="4" x2="12" y2="20"
          stroke="currentColor" strokeWidth="1.5" className="text-indigo-400"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        <motion.line
          x1="4" y1="12" x2="20" y2="12"
          stroke="currentColor" strokeWidth="1.5" className="text-indigo-400"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.7 }}
        />
      </svg>

      {/* Triangle */}
      <svg className="absolute top-[45%] right-[3%] w-10 h-10 opacity-[0.06]" viewBox="0 0 24 24">
        <motion.path
          d="M12 4L22 20H2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-purple-400"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
      </svg>
    </div>
  );
}
