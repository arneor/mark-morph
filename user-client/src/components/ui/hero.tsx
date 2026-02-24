"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shapes, ArrowRight, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
    const router = useRouter();
    return (
        <section id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background py-20">
            <div className="absolute left-8 top-8">
                <Link href="/" className="relative block w-6 h-6 group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-300">
                    <Image
                        src="/black-logo.png"
                        alt="LinkBeet Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* Login Button Group with Arrow - Top Right */}
            <div className="absolute right-8 top-8 z-50">
                <div id="gooey-btn" className="relative flex items-center group">
                    <button
                        onClick={() => router.push("/login")}
                        className="absolute right-0 px-2.5 py-2 rounded-full bg-black text-white font-normal text-xs transition-all duration-300 hover:bg-black/90 cursor-pointer h-8 flex items-center justify-center translate-x-0 group-hover:-translate-x-20 z-0 shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </button>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-2 rounded-full bg-black text-white font-normal text-xs transition-all duration-300 hover:bg-black/90 cursor-pointer h-8 flex items-center z-10 shadow-lg">
                        Login
                    </button>
                </div>
            </div>
            {/* Top Badge */}
            <div className="z-10 mb-12 pt-16 md:pt-0 flex justify-center relative w-full">
                <div className="relative flex items-center whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-sm leading-6 text-muted-foreground hover:bg-muted/50 transition-colors">
                    <Shapes className="h-4 w-4 mr-2" />
                    <span className="font-medium">Introducing Near Me.</span>
                    <Link
                        href="/near-me"
                        className="hover:text-foreground ml-1 flex items-center font-semibold transition-colors group"
                    >
                        <span className="ml-1">Explore Offers</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>

            {/* Main Content Area - Using exact container structure requested by user */}
            <div className="px-2 w-full max-w-7xl relative z-10">
                <div className="border-border relative mx-auto h-full border p-6 mask-[radial-gradient(800rem_96rem_at_center,white,transparent)] md:px-12 md:py-20">
                    <h1 className="flex select-none flex-col items-center justify-center px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight md:flex-col md:text-8xl lg:text-9xl text-foreground">
                        <Plus
                            strokeWidth={2}
                            className="text-foreground absolute -left-5 -top-5 h-10 w-10"
                        />
                        <Plus
                            strokeWidth={2}
                            className="text-foreground absolute -bottom-5 -left-5 h-10 w-10"
                        />
                        <Plus
                            strokeWidth={2}
                            className="text-foreground absolute -right-5 -top-5 h-10 w-10"
                        />
                        <Plus
                            strokeWidth={2}
                            className="text-foreground absolute -bottom-5 -right-5 h-10 w-10"
                        />
                        <span> Your complete platform for the Connection.</span>
                    </h1>

                    <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
                        <span className="relative flex h-3 w-3 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">Available Now</p>
                    </div>
                </div>
            </div>

            {/* Subheadline & CTA */}
            {/* Subheadline & CTA - Combined Section for Spacing */}
            <div className="mt-16 w-full max-w-3xl px-6 text-center z-10 flex flex-col items-center gap-10 pb-24">
                <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                        Welcome to <span className="font-bold">LinkBeet</span>
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Turn WiFi access into your complete digital presence. Engage customers the moment they connect.
                    </p>
                </div>


                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-element animate-delay-300">
                    <div className="relative group w-full sm:w-auto">
                        {/* Animated SVG Border Overlay */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                            <rect
                                x="1"
                                y="1"
                                width="calc(100% - 2px)"
                                height="calc(100% - 2px)"
                                rx="38"
                                ry="38"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="3 4"
                                className="text-black/50 group-hover:text-black/80 transition-colors duration-300 animate-[hero-svg-march_20s_linear_infinite]"
                            />
                        </svg>
                        <Button
                            asChild
                            size="lg"
                            className="relative rounded-full px-8 py-6 text-base font-medium bg-transparent border-2 border-transparent text-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-md w-full z-10"
                        >
                            <Link href="/near-me">
                                <span className="relative flex h-5 w-5 mr-2">
                                    <MapPin className="absolute animate-ping h-5 w-5 text-current opacity-75" />
                                    <MapPin className="relative h-5 w-5 text-current" />
                                </span>
                                Explore Near Me Offers
                            </Link>
                        </Button>
                    </div>
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full px-8 py-6 text-base font-medium bg-transparent border-2 border-black border-dotted text-black hover:bg-black hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                    >
                        <Link href="/signup">
                            Start Your Journey
                            <ArrowRight className="ml-2 h-5 w-5 text-current" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};
