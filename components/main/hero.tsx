"use client"

import React, { useRef } from "react"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"
import { motion } from "motion/react"
import { PortfolioIllustration, AiNewsIllustration, SavingsIllustration } from "@/components/ui/illustrations"
import Link from "next/link"
import dynamic from "next/dynamic"

const FluidGradient = dynamic(
    () => import("@/components/ui/fluid-gradient").then((mod) => mod.FluidGradient),
    { ssr: false }
)

interface Feature {
    title: string;
    description: string;
    icon: any;
    href?: string;
}

const features: Feature[] = [
    {
        title: "포트폴리오 시각화",
        description: "흩어진 주식 보유 종목을 한눈에 보여줍니다.",
        icon: PortfolioIllustration,
        href: "/visual_portfolio",
    },
    {
        title: "AI 뉴스 분석",
        description: "뉴스의 핵심만 3줄 요약, 호재와 악재를 AI가 판별해서 소개해드립니다.",
        icon: AiNewsIllustration,
    },
    {
        title: "스마트 예적금",
        description: "최신 특판 비교부터 우대 조건 분석, 세후 실수령액 계산까지 한번에 끝내드립니다.",
        icon: SavingsIllustration,
    },
]

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <div
            ref={containerRef}
            className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-white px-4 py-20"
        >
            <FluidGradient />
            <div className="z-10 flex flex-col items-center justify-center gap-6 text-center mb-16">
                <h1 className="text-6xl font-bold tracking-tight sm:text-8xl md:text-9xl">
                    <TextCursorProximity
                        label="Vistafolio"
                        containerRef={containerRef}
                        styles={{
                            scale: { from: 1, to: 1.1 },
                            color: { from: "#FFFFFF", to: "#93C572" }, // White to Pistachio
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
                            color: { from: "#FFFFFF", to: "#C9E2B8" },
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
                {features.map((feature, index) => {
                    const CardContent = (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            className="group relative flex flex-col items-center p-8 rounded-3xl border border-white/20 bg-white/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 hover:scale-105 hover:bg-white/30 cursor-pointer h-full"
                        >
                            <div className="mb-6 rounded-full bg-white/20 p-4 text-white group-hover:scale-110 group-hover:bg-pistachio/20 transition-transform duration-300">
                                <feature.icon className="h-12 w-12 stroke-[1.5]" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-black transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-center text-neutral-200 group-hover:text-white transition-colors">
                                {feature.description}
                            </p>
                        </motion.div>
                    )

                    return (
                        <React.Fragment key={index}>
                            {feature.href ? (
                                <Link href={feature.href} className="w-full h-full block">
                                    {CardContent}
                                </Link>
                            ) : (
                                <div className="w-full h-full block">
                                    {CardContent}
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-16 z-10"
            >
                <a
                    href="/auth"
                    className="inline-flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 active:scale-95 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] group"
                >
                    Get Started
                    <svg
                        className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </a>
            </motion.div>


        </div>
    )
}
