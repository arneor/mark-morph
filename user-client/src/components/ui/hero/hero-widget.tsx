"use client"

import { useState, useEffect } from "react"
import { PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"

export function HeroWidget() {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="absolute bottom-8 right-8 z-50">
            <div className="relative w-20 h-20 flex items-center justify-center">
                {/* 
                    Fallback Circle
                    Renders immediately, replacing the black void during hydration.
                */}
                <div
                    className="absolute w-[60px] h-[60px] rounded-full border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    style={{
                        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)'
                    }}
                />

                {isMounted && (
                    <div className="animate-in fade-in duration-700">
                        <PulsingBorder
                            colors={["#06b6d4", "#0891b2", "#f97316", "#00FF88", "#ffffff"]}
                            colorBack="#00000000"
                            speed={1.5}
                            roundness={1}
                            thickness={0.1}
                            softness={0.2}
                            intensity={5}
                            spots={5}
                            spotSize={0.1}
                            pulse={0.1}
                            smoke={0.5}
                            smokeSize={4}
                            scale={0.65}
                            rotation={0}
                            frame={9161408.251009725}
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                            }}
                        />
                    </div>
                )}

                {/* Rotating Text - SSR/CS Compatible - Always visible */}
                <motion.svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                    style={{ transform: "scale(1.6)" }}
                >
                    <defs>
                        <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                    </defs>
                    <text className="text-sm fill-white/80 font-medium">
                        <textPath href="#circle" startOffset="0%">
                            LinkBeet • WiFi → Brand • LinkBeet • WiFi → Brand • LinkBeet • WiFi → Brand •
                        </textPath>
                    </text>
                </motion.svg>
            </div>
        </div>
    )
}
