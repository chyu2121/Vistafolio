"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useMotionValueEvent } from "motion/react"
import { cn } from "@/lib/utils"

export default function Navbar() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20)
    })

    const links = [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Contact", href: "#contact" },
    ]

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-12 bg-transparent"
        >
            {/* Left: Logo */}
            <div className="flex items-center gap-2 z-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative h-[80px] w-[80px]">
                        <Image
                            src="/Vistafolio_CI_배경.png"
                            alt="Vistafolio Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </Link>
            </div>

            {/* Center: Links (Absolute to ensure true center) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="text-sm font-medium text-pistachio hover:text-white transition-colors"
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            {/* Right: Get Started Button */}
            <div className="flex items-center gap-4 z-10">
                <Link href="/auth">
                    <button className="hidden md:block rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Get Started
                    </button>
                    {/* Mobile only icon/button if needed, but for now just the button on desktop */}
                </Link>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="4" x2="20" y1="12" y2="12" />
                        <line x1="4" x2="20" y1="6" y2="6" />
                        <line x1="4" x2="20" y1="18" y2="18" />
                    </svg>
                </button>
            </div>
        </motion.nav>
    )
}
