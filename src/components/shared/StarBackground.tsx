"use client";

import { motion } from "framer-motion";
import React from "react";

export const StarBackground = () => {
    return (
        <div className="fixed inset-0 -z-20 h-full w-full overflow-hidden bg-[#030014]" suppressHydrationWarning>
            {/* Radial Gradient overlay for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(40,10,80,0.5)_0%,rgba(0,0,0,0)_50%)]" suppressHydrationWarning />

            {/* Stars Layer 1 - Slow */}
            <motion.div
                initial={{ y: 0, opacity: 0.3 }}
                animate={{
                    y: [-100, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"
                suppressHydrationWarning
            />

            {/* Floating Orbs / Nebula parts */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
                className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-purple-900/30 blur-[100px]"
                suppressHydrationWarning
            />

            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -30, 0],
                    y: [0, 50, 0]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
                className="absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-cyan-900/20 blur-[100px]"
                suppressHydrationWarning
            />
        </div>
    );
};

