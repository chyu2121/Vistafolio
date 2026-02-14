"use client"

import React, { useRef } from "react"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"
import { motion } from "motion/react"
import { PortfolioIllustration, AiNewsIllustration, SavingsIllustration } from "@/components/ui/illustrations"

const features = [
    {
        title: "Visual Portfolio",
        description: "Your assets, beautifully visualized in one glance.",
        icon: PortfolioIllustration,
    },
    {
        title: "AI News Analysis",
        description: "Instant good/bad news verdict with 3-line summaries.",
        icon: AiNewsIllustration,
    },
    {
        title: "Smart Savings",
        description: "Find high-yield savings & calculate real returns.",
        icon: SavingsIllustration,
    },
]

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <div
            ref={containerRef}
            className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white px-4 py-20"
        >
            <div className="z-10 flex flex-col items-center justify-center gap-6 text-center mb-16">
                <h1 className="text-6xl font-bold tracking-tight sm:text-8xl md:text-9xl">
                    <TextCursorProximity
                        label="Vistafolio"
                        containerRef={containerRef}
                        styles={{
                            scale: { from: 1, to: 1.1 },
                            color: { from: "#93C572", to: "#C9E2B8" },
                            opacity: { from: 1, to: 0.9 },
                        }}
                        falloff="gaussian"
                        radius={200}
                        className="cursor-default select-none transition-colors duration-300"
                    />
                </h1>
                <p className="max-w-xl text-xl text-neutral-400">
                    <TextCursorProximity
                        label="Clear Sight, Better Wealth"
                        containerRef={containerRef}
                        styles={{
                            color: { from: "#a3a3a3", to: "#C9E2B8" },
                            y: { from: 0, to: -2 },
                        }}
                        falloff="linear"
                        radius={100}
                        className="cursor-default select-none font-medium"
                    />
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className="group relative flex flex-col items-center p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm hover:border-pistachio/50 hover:bg-neutral-900/80 transition-all duration-300"
                    >
                        <div className="mb-6 rounded-full bg-neutral-800/50 p-4 text-pistachio group-hover:scale-110 group-hover:bg-pistachio/10 transition-transform duration-300">
                            <feature.icon className="h-12 w-12 stroke-[1.5]" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-pistachio transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-center text-neutral-400 group-hover:text-neutral-300 transition-colors">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Decorative background elements */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-pistachio opacity-10 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 -z-10 h-[200px] w-[200px] rounded-full bg-blue-500 opacity-5 blur-[80px]"></div>
        </div>
    )
}
