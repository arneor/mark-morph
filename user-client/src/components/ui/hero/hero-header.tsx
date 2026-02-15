"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function HeroHeader() {
    const router = useRouter()
    const [particles, setParticles] = useState<Array<{ left: string; top: string; targetX: number }>>([])

    useEffect(() => {
        const timer = setTimeout(() => {
            setParticles(
                Array.from({ length: 6 }).map(() => ({
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    targetX: Math.random() * 20 - 10,
                })),
            )
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    return (
        <header className="relative z-50 flex items-center justify-between p-6">
            <motion.div
                className="flex items-center group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <div
                    className="relative w-10 h-10 group-hover:drop-shadow-lg transition-all duration-300"
                    style={{ filter: "url(#logo-glow)" }}
                >
                    <Image
                        src="/logo.png"
                        alt="LinkBeet Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {particles.map((p, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/60 rounded-full"
                            style={{
                                left: p.left,
                                top: p.top,
                            }}
                            animate={{
                                y: [-10, -20, -10],
                                x: [0, p.targetX, 0],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Navigation */}
            <nav className="flex items-center space-x-2">
                <a
                    href="#"
                    className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                >
                    Features
                </a>
                <a
                    href="#"
                    className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                >
                    Pricing
                </a>
                <a
                    href="#"
                    className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                >
                    Docs
                </a>
            </nav>

            {/* Login Button Group with Arrow */}
            <div id="gooey-btn" className="relative flex items-center group" style={{ filter: "url(#gooey-filter)" }}>
                <button
                    onClick={() => router.push("/login")}
                    className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-19 z-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                </button>
                <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center z-10">
                    Login
                </button>
            </div>
        </header>
    )
}
