"use client";
import Image from "next/image";
import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { Wifi, Link, ShoppingBag, Image as ImageIcon } from "lucide-react";

export function HowItWorksSection() {
    const shadowClass = "shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]";

    const data = React.useMemo(() => [
        {
            title: "Step 1",
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                            <Wifi className="w-5 h-5 text-cyan-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-800">Customer Connects to WiFi</h3>
                    </div>
                    <p className="text-neutral-600 text-sm md:text-base font-normal mb-6 leading-relaxed">
                        When customers connect to your WiFi, they&apos;re greeted with your beautifully branded portal instead of a generic login page. This is where first impressions turn into lasting connections.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Image
                            src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=500&q=60"
                            alt="Cafe customer with phone"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Image
                            src="https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=500&q=60"
                            alt="WiFi connection screen"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Step 2",
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Link className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-800">Discover Your Digital Hub</h3>
                    </div>
                    <p className="text-neutral-600 text-sm md:text-base font-normal mb-6 leading-relaxed">
                        Your portal becomes a gateway to everything you offer. Social links, booking pages, menus, promotions—all accessible in one tap. No more searching, no more friction.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Image
                            src="/how-it-work/setp-2-first.jpeg"
                            alt="Mobile interface with links"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Image
                            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=500&q=60"
                            alt="Digital menu display"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Step 3",
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-800">Browse Products & Catalogs</h3>
                    </div>
                    <p className="text-neutral-600 text-sm md:text-base font-normal mb-6 leading-relaxed">
                        Showcase your products, services, or menu items right where customers are already engaged. They can explore your offerings without leaving the WiFi portal—turning browsers into buyers.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Image
                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=60"
                            alt="Product catalog display"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Image
                            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=500&q=60"
                            alt="Shopping experience"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Step 4",
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-800">Experience Visual Stories</h3>
                    </div>
                    <p className="text-neutral-600 text-sm md:text-base font-normal mb-6 leading-relaxed">
                        Share your brand story through stunning galleries. From behind-the-scenes moments to product highlights, events, and customer experiences—visuals that inspire and connect.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Image
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=60"
                            alt="Gallery showcase"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Image
                            src="https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?auto=format&fit=crop&w=500&q=60"
                            alt="Visual storytelling"
                            width={500}
                            height={500}
                            className={`rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full ${shadowClass}`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            ),
        },
    ], [shadowClass]);

    return (
        <div className="w-full bg-white">
            <Timeline
                data={data}
                title="How It Works"
                description="From WiFi connection to complete engagement—see how LinkBeet transforms every customer touchpoint into an opportunity."
            />
        </div>
    );
}