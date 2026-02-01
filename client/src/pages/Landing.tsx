import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Palette,
  Zap,
  Shield,
  Globe,
  QrCode,
  Mail,
  TrendingUp,
  Smartphone,
  Instagram,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SEO, SEO_CONFIG } from "@/components/SEO";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Feature data for the features section
const features = [
  {
    icon: Palette,
    title: "Brand Customization",
    description:
      "Fully customize your WiFi portal with your logo, colors, and branding to match your business identity.",
    gradient: "gradient-lime-cyan",
    color: "#9EE53B",
  },
  {
    icon: Mail,
    title: "Email Capture",
    description:
      "Collect customer emails automatically when they connect. Build your mailing list effortlessly.",
    gradient: "gradient-purple-pink",
    color: "#A855F7",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track visits, engagement, and ad performance with detailed analytics and insights dashboard.",
    gradient: "gradient-pink-orange",
    color: "#E639D0",
  },
  {
    icon: QrCode,
    title: "QR Code Integration",
    description:
      "Generate custom QR codes for easy WiFi access. Perfect for table tents, posters, and more.",
    gradient: "gradient-blue-purple",
    color: "#28C5F5",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description:
      "Get started in minutes with our easy setup wizard. No technical knowledge required.",
    gradient: "gradient-lime-cyan",
    color: "#43E660",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "Enterprise-grade security with GDPR compliance. Your data and customers are protected.",
    gradient: "gradient-purple-pink",
    color: "#FF3366",
  },
];

// Stats for social proof
// Stats for MVP - focus on features/benefits not user counts
const stats = [
  { value: "5 min", label: "Setup Time" },
  { value: "100%", label: "Cloud Managed" },
  { value: "Free", label: "Early Access" },
  { value: "24/7", label: "Automated Marketing" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Landing() {
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    // In a real app we'd call the API login here
    const email = data.email.trim().toLowerCase();
    if (email.includes("admin")) {
      setLocation("/admin");
      return;
    }
    // Redirect to signup for new users
    setLocation("/signup");
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* SEO Meta Tags */}
      <SEO {...SEO_CONFIG.homepage} />

      {/* ============================================ */}
      {/* HERO SECTION - Vibrant gradient background */}
      {/* ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animated-gradient opacity-90" />

        {/* Floating blob decorations */}
        <div
          className="absolute top-20 left-10 w-72 h-72 blob opacity-30 animate-float"
          style={{ background: "linear-gradient(135deg, #9EE53B, #43E660)" }}
        />
        <div
          className="absolute bottom-40 right-20 w-96 h-96 blob opacity-20 animate-float-delayed"
          style={{ background: "linear-gradient(135deg, #A855F7, #E639D0)" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 blob opacity-25 animate-float-delayed-2"
          style={{ background: "linear-gradient(135deg, #28C5F5, #3CEAC8)" }}
        />

        {/* Grid overlay for depth */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Smart WiFi Advertising Platform</span>
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-white leading-[1.1] tracking-tight">
                Turn your{" "}
                <span className="relative">
                  <span className="relative z-10">Free WiFi</span>
                  <span
                    className="absolute bottom-2 left-0 right-0 h-4 -z-0 opacity-50"
                    style={{ background: "#222" }}
                  />
                </span>{" "}
                into a{" "}
                <span className="text-[#222]">Marketing Engine</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-white/90 leading-relaxed max-w-lg">
                Capture emails, display targeted ads, and grow your business
                while providing seamless connectivity. Start growing your customer database today with MarkMorph.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  { icon: CheckCircle2, text: "Easy Setup" },
                  { icon: BarChart3, text: "Real-time Analytics" },
                  { icon: Palette, text: "Brand Customization" },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20"
                  >
                    <item.icon className="w-4 h-4 text-[#222]" />
                    <span className="font-medium text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
              >
                <Button
                  size="lg"
                  onClick={() => setLocation("/signup")}
                  className="h-14 px-8 text-lg font-bold rounded-full bg-[#222] text-white hover:bg-[#333] shadow-2xl shadow-black/30 transition-all duration-300 hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open("https://docs.markmorph.in/", "_blank")}
                  className="h-14 px-8 text-lg font-bold rounded-full bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column: Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateY: -10 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="perspective-1000"
            >
              <Card className="w-full max-w-md mx-auto shadow-2xl border-0 backdrop-blur-xl bg-white/95 rounded-3xl overflow-hidden">
                {/* Card gradient top border */}
                <div className="h-2 gradient-hero" />

                <CardHeader className="space-y-2 pt-8 pb-4 px-8">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src="/white_icon.webp"
                      alt="MarkMorph"
                      className="h-12 w-auto"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-display text-gray-900">
                      Welcome back
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Sign in to your dashboard
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    <p className="text-gray-500 text-center">
                      Join thousands of businesses using MarkMorph to grow their customer base.
                    </p>

                    <Button
                      onClick={() => setLocation("/login")}
                      className="w-full h-14 text-lg font-bold rounded-xl gradient-lime-cyan text-[#222] hover:opacity-90 shadow-lg shadow-[#9EE53B]/30 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <Smartphone className="w-5 h-5 mr-2" />
                      Sign In with Email
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-14 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-[#9EE53B] hover:bg-[#9EE53B]/5 transition-all"
                      onClick={() => setLocation("/signup")}
                    >
                      Create Account
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      Ready to get started?
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full h-12 rounded-xl text-[#A855F7] hover:bg-[#A855F7]/10 font-semibold transition-all"
                      onClick={() => setLocation("/signup")}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Create Your Portal Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-3 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* STATS SECTION - Social Proof */}
      {/* ============================================ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-extrabold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section className="py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] blob opacity-10"
          style={{ background: "linear-gradient(135deg, #9EE53B, #3CEAC8)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] blob opacity-10"
          style={{ background: "linear-gradient(135deg, #A855F7, #E639D0)" }}
        />

        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9EE53B]/10 text-[#6BBF00] text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-gray-900 mb-6">
              Everything you need to{" "}
              <span className="gradient-text-pink">supercharge</span> your WiFi
            </h2>
            <p className="text-xl text-gray-500">
              A complete toolkit to transform your guest WiFi into a powerful
              marketing and engagement platform.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="feature-card group cursor-pointer"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-[#222]" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>

                {/* Learn more link */}
                <div
                  className="mt-6 flex items-center gap-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: feature.color }}
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS SECTION */}
      {/* ============================================ */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#9EE53B]/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#A855F7]/20 blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-[#9EE53B] text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6">
              Get started in{" "}
              <span className="text-[#9EE53B]">3 simple steps</span>
            </h2>
            <p className="text-xl text-gray-400">
              Transform your WiFi into a marketing tool in minutes, not hours.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Create Your Portal",
                description:
                  "Sign up and customize your branded WiFi splash page with your logo, colors, and content.",
                color: "#9EE53B",
              },
              {
                step: "02",
                title: "Connect Your Router",
                description:
                  "Follow our simple guide to connect your router. Works with most commercial routers.",
                color: "#28C5F5",
              },
              {
                step: "03",
                title: "Start Capturing Leads",
                description:
                  "Watch as customers connect and you build your email list automatically.",
                color: "#E639D0",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                {/* Step number */}
                <div
                  className="text-7xl font-display font-extrabold opacity-10 absolute top-4 right-6"
                  style={{ color: item.color }}
                >
                  {item.step}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: item.color }}
                  >
                    <span className="text-[#222] font-bold text-lg">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIAL / TRUST SECTION */}
      {/* ============================================ */}


      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-95" />

        {/* Floating decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white/10 animate-float-delayed" />
        <div className="absolute top-1/2 right-10 w-24 h-24 rounded-full bg-white/10 animate-float-delayed-2" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-6">
              Ready to transform your WiFi?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Start using MarkMorph today to grow your
              customer base.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/signup")}
                className="h-16 px-10 text-xl font-bold rounded-full bg-[#222] text-white hover:bg-[#333] shadow-2xl shadow-black/30 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/signup")}
                className="h-16 px-10 text-xl font-bold rounded-full bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
              >
                Start Free Trial
              </Button>
            </div>

            <p className="mt-8 text-white/70 text-sm">
              No credit card required • Free forever plan available • Setup in 5
              minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER - Minimal & Modern (Linktree-inspired) */}
      {/* ============================================ */}
      <footer className="bg-[#0d1117] py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo - Text Wordmark */}
            <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white">
              Mark<span className="text-[#9EE53B]">Morph</span><span className="text-[#9EE53B]">.</span>
            </h2>

            {/* Social Icons */}
            <div className="flex items-center gap-5">
              <a
                href="https://www.instagram.com/markmorrph?igsh=ZXNsNGszMXdqcDZo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-[#9EE53B] hover:text-[#0d1117] transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1CNjW7obCj/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-[#9EE53B] hover:text-[#0d1117] transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>

            {/* Divider */}
            <div className="w-full max-w-xs h-px bg-white/10" />

            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © 2026 MarkMorph. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
