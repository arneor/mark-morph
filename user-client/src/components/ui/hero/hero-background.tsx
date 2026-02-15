"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { useState, useEffect } from "react"

export function HeroBackground() {
    const [showShader, setShowShader] = useState(false)

    useEffect(() => {
        // Only load shader on non-mobile devices to save performance
        const checkMobile = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches
            setShowShader(!isMobile)
        }

        checkMobile()

        // Optional: Listen for resize if you want dynamic switching (usually not needed for landing pages)
        // window.addEventListener('resize', checkMobile)
        // return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div className="absolute inset-0 w-full h-full bg-slate-950 will-change-transform">
            {/* 
                Static CSS Gradient Fallback 
                This renders immediately on the server/initial HTML, preventing the "black void"
                while the heavy WebGL shaders load.
            */}
            <div
                className="absolute inset-0 w-full h-full opacity-80"
                style={{
                    background: `
                        radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 1) 100%),
                        radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.5) 0%, transparent 40%),
                        radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 40%),
                        radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.3) 0%, transparent 40%)
                    `,
                    filter: 'blur(60px)'
                }}
            />

            {/* 
                Heavy Shader Component 
                Only rendered after the client has mounted to avoid hydration mismatches.
                The fallback above ensures the user sees something beautiful instantly.
            */}
            {showShader && (
                <div className="absolute inset-0 w-full h-full animate-in fade-in duration-1000">
                    <MeshGradient
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
                        speed={0.3}
                    />
                    <MeshGradient
                        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
                        colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
                        speed={0.2}
                    />
                </div>
            )}
        </div>
    )
}
