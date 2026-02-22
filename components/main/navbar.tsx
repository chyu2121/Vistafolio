"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent } from "motion/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

export default function Navbar() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
    const [isSigningOut, setIsSigningOut] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await supabase.auth.signOut()
        } finally {
            window.location.href = "/"
        }
    }

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20)
    })

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setAvatarUrl(session?.user.user_metadata?.avatar_url as string | undefined)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setAvatarUrl(session?.user?.user_metadata?.avatar_url as string | undefined)
        })

        return () => subscription.unsubscribe()
    }, [])

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
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-12 bg-gradient-to-b from-black/5 to-black/0 backdrop-blur-sm border-b border-white/0"
        >
            {/* Left: Logo & Admin */}
            <div className="flex items-center gap-3 z-10">
                <Link href="/" className="flex items-center group">
                    <span className="text-xl font-bold tracking-tight text-white hover:text-[#93C572] transition-colors duration-300">
                        Vistafolio
                    </span>
                </Link>
                {!user && (
                    <Link href="/admin/login">
                        <button className="hidden md:block rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer">
                            Admin
                        </button>
                    </Link>
                )}
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

            {/* Right: Get Started Button or User Profile */}
            <div className="flex items-center gap-3 z-10">
                {user ? (
                    <>
                        <Link href="/dashboard">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={user.email}
                                    className="hidden md:block h-8 w-8 rounded-full object-cover ring-2 ring-white/20 cursor-pointer hover:ring-[#93C572]/50 transition-all"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-[#93C572]/20 text-xs font-semibold text-[#93C572] ring-2 ring-[#93C572]/30 cursor-pointer hover:ring-[#93C572]/50 transition-all">
                                    {(user.user_metadata?.full_name as string)?.[0]?.toUpperCase() ?? "U"}
                                </div>
                            )}
                        </Link>
                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="hidden md:flex items-center gap-2 rounded-lg border border-[#93C572]/40 bg-[#93C572]/10 px-3 py-2 text-xs font-medium text-[#93C572] transition-all hover:border-[#93C572]/80 hover:bg-[#93C572]/30 hover:text-white hover:shadow-[0_0_16px_rgba(147,197,114,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSigningOut ? (
                                <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            )}
                        </button>
                    </>
                ) : (
                    <Link href="/auth">
                        <button className="hidden md:block rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer">
                            Dashboard
                        </button>
                    </Link>
                )}

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
