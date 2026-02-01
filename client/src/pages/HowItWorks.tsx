import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
    Wifi,
    ArrowRight,
    CheckCircle2,
    Smartphone,
    BarChart3,
    Star,
    Mail,
    Users,
    TrendingUp,
    Shield,
    Zap,
    Globe,
    QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const steps = [
    {
        number: "01",
        title: "Customer Connects to Your Wi-Fi",
        description:
            "When a customer enters your establishment and looks for Wi-Fi, they discover your branded network. No complicated passwords needed – just a simple, welcoming connection experience that reflects your business identity.",
        icon: Wifi,
        color: "#9EE53B",
        details: [
            "Automatic network detection on customer devices",
            "Branded network name (SSID) with your business name",
            "Works with any existing router – no new hardware needed",
            "Seamless connection process for returning customers",
        ],
    },
    {
        number: "02",
        title: "They See Your Branded Splash Page",
        description:
            "Before accessing the internet, customers are presented with your beautifully designed captive portal. This is your moment to showcase promotions, collect emails, and request Google reviews – all while they wait for connectivity.",
        icon: Smartphone,
        color: "#A855F7",
        details: [
            "Fully customizable with your logo, colors, and branding",
            "Display promotional banners and special offers",
            "Collect customer emails for newsletter marketing",
            "Optional social login (Facebook, Google) for easy access",
        ],
    },
    {
        number: "03",
        title: "You Capture Valuable Customer Data",
        description:
            "Every interaction is recorded. Email addresses, visit frequency, time spent – you get a complete picture of your customer base. This data becomes the foundation for targeted marketing campaigns.",
        icon: Mail,
        color: "#E639D0",
        details: [
            "Automatic email collection with opt-in consent",
            "Track visit frequency and customer loyalty",
            "Understand peak hours and busy periods",
            "Build segmented customer lists for marketing",
        ],
    },
    {
        number: "04",
        title: "Analytics Power Your Decisions",
        description:
            "Access real-time dashboards that show exactly how your Wi-Fi is performing. See how many customers connected, which ads they viewed, and how many reviews you received – all in one place.",
        icon: BarChart3,
        color: "#28C5F5",
        details: [
            "Real-time visitor analytics and trends",
            "Ad impression and click-through tracking",
            "Review generation performance metrics",
            "Export data for external analysis",
        ],
    },
    {
        number: "05",
        title: "Google Reviews Grow Automatically",
        description:
            "After customers enjoy their experience, Mark Morph automatically prompts them to leave a Google review. This passive system means your online reputation grows without any manual effort from your staff.",
        icon: Star,
        color: "#FFD93D",
        details: [
            "Automated review request at the right moment",
            "Direct link to your Google Business Profile",
            "Track review conversion rates",
            "Increase average star rating over time",
        ],
    },
];

const benefits = [
    {
        icon: TrendingUp,
        title: "Increase Revenue",
        description:
            "Businesses using Wi-Fi marketing see an average 25% increase in repeat customers.",
    },
    {
        icon: Users,
        title: "Build Customer Database",
        description:
            "Collect thousands of verified customer emails for future marketing campaigns.",
    },
    {
        icon: Shield,
        title: "100% GDPR Compliant",
        description:
            "All data collection includes proper consent. Your customers' privacy is protected.",
    },
    {
        icon: Zap,
        title: "5-Minute Setup",
        description:
            "No technical knowledge required. Connect your router and start capturing leads today.",
    },
];

export default function HowItWorks() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-white">
            {/* SEO */}
            <SEO
                title="How Wi-Fi Marketing Works | Mark Morph"
                description="Learn how Mark Morph transforms your guest Wi-Fi into a powerful marketing engine. Capture emails, display ads, and boost Google reviews in 5 simple steps."
                canonicalUrl="/how-it-works"
                keywords="how wifi marketing works, captive portal marketing guide, guest wifi advertising, wifi marketing explained, mark morph tutorial"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "HowTo",
                    "name": "How to Transform Guest Wi-Fi into a Marketing Engine",
                    "description": "A step-by-step guide to using Mark Morph for Wi-Fi marketing",
                    "step": steps.map((step, index) => ({
                        "@type": "HowToStep",
                        "position": index + 1,
                        "name": step.title,
                        "text": step.description,
                    })),
                }}
            />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 animated-gradient opacity-90" />
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/30 mb-6">
                            <Globe className="w-4 h-4" />
                            Understanding Wi-Fi Marketing
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-display font-extrabold text-white leading-tight mb-6">
                            How Mark Morph{" "}
                            <span className="text-[#222]">Transforms</span> Your Guest Wi-Fi
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed mb-8">
                            Every day, customers connect to your Wi-Fi without giving you
                            anything in return. Mark Morph changes that equation – turning
                            every connection into a marketing opportunity.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={() => setLocation("/signup")}
                                className="h-14 px-8 text-lg font-bold rounded-full bg-[#222] text-white hover:bg-[#333] shadow-2xl"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setLocation("/")}
                                className="h-14 px-8 text-lg font-bold rounded-full bg-white/10 text-white border-2 border-white/30 hover:bg-white/20"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                            The 5-Step Wi-Fi Marketing Flow
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            From the moment a customer requests Wi-Fi to when they leave a
                            5-star review, here's exactly how Mark Morph works.
                        </p>
                    </motion.div>

                    <div className="space-y-16">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                                    }`}
                            >
                                {/* Content */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span
                                            className="text-6xl font-display font-black"
                                            style={{ color: step.color }}
                                        >
                                            {step.number}
                                        </span>
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                            style={{ backgroundColor: `${step.color}20` }}
                                        >
                                            <step.icon
                                                className="w-8 h-8"
                                                style={{ color: step.color }}
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-display font-bold text-gray-900">
                                        {step.title}
                                    </h3>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {step.details.map((detail, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2
                                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                                    style={{ color: step.color }}
                                                />
                                                <span className="text-gray-700">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Visual */}
                                <div className="flex-1 w-full max-w-md">
                                    <div
                                        className="aspect-square rounded-3xl p-8 flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(135deg, ${step.color}20, ${step.color}40)`,
                                        }}
                                    >
                                        <step.icon
                                            className="w-32 h-32"
                                            style={{ color: step.color }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                            Why Businesses Choose Mark Morph
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Join thousands of cafes, restaurants, and retail stores across
                            India already growing with Wi-Fi marketing.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                            >
                                <div className="w-14 h-14 rounded-xl bg-[#9EE53B]/20 flex items-center justify-center mb-4">
                                    <benefit.icon className="w-7 h-7 text-[#9EE53B]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#222]">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                            Ready to Transform Your Wi-Fi?
                        </h2>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Setup takes just 5 minutes. No credit card required. Start
                            capturing customer data today.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => setLocation("/signup")}
                            className="h-14 px-10 text-lg font-bold rounded-full bg-[#9EE53B] text-[#222] hover:bg-[#8BD42E] shadow-2xl"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What is Wi-Fi marketing?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Wi-Fi marketing uses your guest Wi-Fi network to capture customer data, display targeted ads, and automate review requests when customers connect to your network.",
                                },
                            },
                            {
                                "@type": "Question",
                                "name": "Do I need special hardware?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "No! Mark Morph works with your existing router. There's no need to purchase new hardware or make complex technical changes.",
                                },
                            },
                            {
                                "@type": "Question",
                                "name": "Is Mark Morph GDPR compliant?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, Mark Morph includes proper consent mechanisms for all data collection, ensuring compliance with GDPR and India's data protection regulations.",
                                },
                            },
                            {
                                "@type": "Question",
                                "name": "How long does setup take?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Most businesses complete setup in under 5 minutes. Simply create an account, customize your splash page, and connect your router.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </div>
    );
}
