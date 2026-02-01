import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import {
    Wifi,
    ArrowRight,
    CheckCircle2,
    MapPin,
    Store,
    Coffee,
    Utensils,
    Dumbbell,
    ShoppingBag,
    Building2,
    Star,
    Users,
    TrendingUp,
    Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

// City-specific data for local SEO
const cityData: Record<
    string,
    {
        name: string;
        state: string;
        description: string;
        businesses: string[];
        landmarks: string[];
        stats: { cafes: string; restaurants: string; gyms: string };
    }
> = {
    // ========== KERALA CITIES (MVP FOCUS) ==========
    kochi: {
        name: "Kochi",
        state: "Kerala",
        description:
            "Kochi, Kerala's commercial capital, blends rich heritage with modern business culture. From Fort Kochi cafes to Kakkanad IT hubs, Mark Morph helps Kochi businesses capture customer data, display targeted ads, and boost Google reviews.",
        businesses: [
            "Fort Kochi heritage cafes",
            "Marine Drive restaurants",
            "Kakkanad IT hub cafeterias",
            "MG Road retail stores",
            "Panampilly Nagar bistros",
            "Infopark tech eateries",
        ],
        landmarks: ["Fort Kochi", "Marine Drive", "Kakkanad", "MG Road", "Panampilly Nagar", "Infopark"],
        stats: { cafes: "1,200+", restaurants: "3,500+", gyms: "200+" },
    },
    thiruvananthapuram: {
        name: "Thiruvananthapuram",
        state: "Kerala",
        description:
            "Thiruvananthapuram, Kerala's capital city, is home to Technopark, prestigious institutions, and a thriving hospitality sector. Mark Morph empowers businesses from Kovalam resorts to Technopark cafeterias with smart Wi-Fi marketing.",
        businesses: [
            "Technopark IT cafeterias",
            "Kovalam beach resorts",
            "MG Road shopping outlets",
            "Vazhuthacaud restaurants",
            "Pattom fitness centers",
            "Kazhakoottam tech hubs",
        ],
        landmarks: ["Technopark", "Kovalam", "MG Road", "Vazhuthacaud", "Pattom", "Kazhakoottam"],
        stats: { cafes: "800+", restaurants: "2,500+", gyms: "150+" },
    },
    kozhikode: {
        name: "Kozhikode",
        state: "Kerala",
        description:
            "Kozhikode (Calicut), the city of spices and Malabar cuisine, has a vibrant food culture. From SM Street cafes to beach restaurants, Mark Morph helps Kozhikode businesses transform guest Wi-Fi into marketing power.",
        businesses: [
            "SM Street (Mittai Theruvu) cafes",
            "Beach restaurants and resorts",
            "Mavoor Road retail shops",
            "Palayam fitness studios",
            "Fathima Hospital area eateries",
            "Cyberpark tech cafeterias",
        ],
        landmarks: ["SM Street", "Kozhikode Beach", "Mavoor Road", "Palayam", "Mananchira", "Cyberpark"],
        stats: { cafes: "600+", restaurants: "1,800+", gyms: "100+" },
    },
    thrissur: {
        name: "Thrissur",
        state: "Kerala",
        description:
            "Thrissur, the cultural capital of Kerala, hosts Pooram and has a buzzing retail scene. From Swaraj Round cafes to Mall Road restaurants, Mark Morph helps Thrissur businesses engage with customers through Wi-Fi.",
        businesses: [
            "Swaraj Round cafes",
            "Mall Road restaurants",
            "Shoranur Road retail outlets",
            "Punkunnam fitness centers",
            "Ayyanthole bakeries",
            "Puzhakkal shopping malls",
        ],
        landmarks: ["Swaraj Round", "Mall Road", "Shoranur Road", "Punkunnam", "Ayyanthole", "Puzhakkal"],
        stats: { cafes: "500+", restaurants: "1,500+", gyms: "80+" },
    },
    kollam: {
        name: "Kollam",
        state: "Kerala",
        description:
            "Kollam, the gateway to Kerala's backwaters, has a growing business community. From Beach Road cafes to Chinnakada restaurants, Mark Morph powers customer engagement for Kollam businesses.",
        businesses: [
            "Beach Road cafes",
            "Chinnakada restaurants",
            "Asramam Lake resorts",
            "Kadappakada retail shops",
            "Polayathode gyms",
            "Kottiyam eateries",
        ],
        landmarks: ["Beach Road", "Chinnakada", "Asramam Lake", "Kadappakada", "Polayathode", "Kottiyam"],
        stats: { cafes: "350+", restaurants: "1,000+", gyms: "50+" },
    },
    alappuzha: {
        name: "Alappuzha",
        state: "Kerala",
        description:
            "Alappuzha (Alleppey), famous for houseboats and backwaters, thrives on tourism. From beach cafes to houseboat restaurants, Mark Morph helps Alappuzha hospitality businesses capture tourist data.",
        businesses: [
            "Alappuzha Beach cafes",
            "Houseboat restaurants",
            "Mullakkal Road retail shops",
            "Punnapra resorts",
            "Thathampally eateries",
            "Finishing Point cafeterias",
        ],
        landmarks: ["Alappuzha Beach", "Backwaters", "Mullakkal", "Punnapra", "Thathampally", "Finishing Point"],
        stats: { cafes: "300+", restaurants: "900+", gyms: "40+" },
    },
    kannur: {
        name: "Kannur",
        state: "Kerala",
        description:
            "Kannur, the land of looms and lore, has a growing cafe culture. From Fort Road cafes to City Centre restaurants, Mark Morph helps Kannur businesses grow through smart Wi-Fi marketing.",
        businesses: [
            "Fort Road cafes",
            "City Centre restaurants",
            "Caltex Junction retail shops",
            "Thavakkara fitness studios",
            "Burnassery bakeries",
            "South Bazaar eateries",
        ],
        landmarks: ["Fort Road", "City Centre", "Caltex Junction", "Thavakkara", "Burnassery", "South Bazaar"],
        stats: { cafes: "400+", restaurants: "1,200+", gyms: "60+" },
    },
    kottayam: {
        name: "Kottayam",
        state: "Kerala",
        description:
            "Kottayam, the literary hub of Kerala, has a thriving business community. From Baker Junction cafes to Good Shepherd restaurants, Mark Morph powers customer engagement for Kottayam businesses.",
        businesses: [
            "Baker Junction cafes",
            "Good Shepherd area restaurants",
            "KK Road retail outlets",
            "Nagampadam fitness centers",
            "Thirunakkara eateries",
            "Kumaranalloor bakeries",
        ],
        landmarks: ["Baker Junction", "Good Shepherd", "KK Road", "Nagampadam", "Thirunakkara", "Kumaranalloor"],
        stats: { cafes: "350+", restaurants: "1,100+", gyms: "55+" },
    },
    palakkad: {
        name: "Palakkad",
        state: "Kerala",
        description:
            "Palakkad, the granary of Kerala, bridges Kerala and Tamil Nadu cultures. From Stadium Bypass cafes to Olavakkode restaurants, Mark Morph helps Palakkad businesses capture customer data.",
        businesses: [
            "Stadium Bypass cafes",
            "Olavakkode restaurants",
            "Head Post Office Road retail",
            "Coimbatore Road eateries",
            "Kalmandapam gyms",
            "English Church Road bistros",
        ],
        landmarks: ["Stadium Bypass", "Olavakkode", "Head Post Office Road", "Coimbatore Road", "Kalmandapam", "Fort Area"],
        stats: { cafes: "280+", restaurants: "800+", gyms: "45+" },
    },
    malappuram: {
        name: "Malappuram",
        state: "Kerala",
        description:
            "Malappuram, with its rich heritage and growing urban centers, offers opportunities for Wi-Fi marketing. From Down Hill cafes to Tirur restaurants, Mark Morph serves Malappuram businesses.",
        businesses: [
            "Down Hill cafes",
            "UP Hill restaurants",
            "Tirur town eateries",
            "Manjeri fitness centers",
            "Perinthalmanna retail shops",
            "Ponnani beach restaurants",
        ],
        landmarks: ["Down Hill", "UP Hill", "Tirur", "Manjeri", "Perinthalmanna", "Ponnani"],
        stats: { cafes: "320+", restaurants: "950+", gyms: "40+" },
    },
    idukki: {
        name: "Idukki",
        state: "Kerala",
        description:
            "Idukki, home to Munnar and Kerala's hills, thrives on tourism. From Munnar tea estate cafes to Thekkady resort restaurants, Mark Morph helps hill station businesses capture tourist data.",
        businesses: [
            "Munnar hill cafes",
            "Thekkady resort restaurants",
            "Thodupuzha town eateries",
            "Kattappana retail shops",
            "Vandiperiyar tea lounges",
            "Vagamon hilltop bistros",
        ],
        landmarks: ["Munnar", "Thekkady", "Thodupuzha", "Kattappana", "Vandiperiyar", "Vagamon"],
        stats: { cafes: "200+", restaurants: "600+", gyms: "25+" },
    },
    wayanad: {
        name: "Wayanad",
        state: "Kerala",
        description:
            "Wayanad, Kerala's green paradise, is a top tourist destination. From Kalpetta cafes to Vythiri resort restaurants, Mark Morph helps Wayanad hospitality businesses grow with Wi-Fi marketing.",
        businesses: [
            "Kalpetta town cafes",
            "Vythiri resort restaurants",
            "Sultan Bathery retail shops",
            "Mananthavady eateries",
            "Meppadi hill cafes",
            "Banasura resort lounges",
        ],
        landmarks: ["Kalpetta", "Vythiri", "Sultan Bathery", "Mananthavady", "Meppadi", "Banasura"],
        stats: { cafes: "180+", restaurants: "500+", gyms: "20+" },
    },
    pathanamthitta: {
        name: "Pathanamthitta",
        state: "Kerala",
        description:
            "Pathanamthitta, gateway to Sabarimala, sees millions of pilgrims annually. From pilgrim town restaurants to Thiruvalla cafes, Mark Morph helps businesses capture customer data.",
        businesses: [
            "Pathanamthitta town cafes",
            "Thiruvalla restaurants",
            "Adoor retail shops",
            "Pandalam eateries",
            "Ranni pilgrim cafeterias",
            "Konni eco-resort lounges",
        ],
        landmarks: ["Pathanamthitta Town", "Thiruvalla", "Adoor", "Pandalam", "Ranni", "Konni"],
        stats: { cafes: "150+", restaurants: "450+", gyms: "20+" },
    },
    kasaragod: {
        name: "Kasaragod",
        state: "Kerala",
        description:
            "Kasaragod, the northernmost district of Kerala, has a unique multicultural identity. From Kasaragod Beach cafes to Kanhangad restaurants, Mark Morph serves this emerging market.",
        businesses: [
            "Kasaragod Beach cafes",
            "Kanhangad restaurants",
            "Bekal resort lounges",
            "Uppala retail shops",
            "Nileshwaram eateries",
            "Manjeshwaram cafeterias",
        ],
        landmarks: ["Kasaragod Beach", "Kanhangad", "Bekal", "Uppala", "Nileshwaram", "Manjeshwaram"],
        stats: { cafes: "120+", restaurants: "400+", gyms: "15+" },
    },

    // ========== OTHER MAJOR INDIAN CITIES ==========
    bangalore: {
        name: "Bangalore",
        state: "Karnataka",
        description:
            "As India's Silicon Valley, Bangalore has thousands of cafes, restaurants, and coworking spaces where customers expect free Wi-Fi. Mark Morph helps Bangalore businesses convert every Wi-Fi connection into a marketing opportunity.",
        businesses: [
            "Tech park cafeterias",
            "Koramangala cafes",
            "Indiranagar restaurants",
            "HSR Layout gyms",
            "MG Road retail stores",
            "Whitefield coworking spaces",
        ],
        landmarks: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "MG Road", "Electronic City"],
        stats: { cafes: "5,000+", restaurants: "12,000+", gyms: "800+" },
    },
    mumbai: {
        name: "Mumbai",
        state: "Maharashtra",
        description:
            "Mumbai, the financial capital of India, has a thriving hospitality sector. From Bandra cafes to Powai restaurants, Mark Morph helps Mumbai businesses capture customer data and boost Google reviews.",
        businesses: [
            "Bandra cafes and bistros",
            "Juhu beachside restaurants",
            "Powai hotel lounges",
            "Lower Parel corporate cafeterias",
            "Andheri fitness centers",
            "Colaba boutique stores",
        ],
        landmarks: ["Bandra", "Juhu", "Powai", "Lower Parel", "Andheri", "Colaba"],
        stats: { cafes: "8,000+", restaurants: "25,000+", gyms: "1,200+" },
    },
    delhi: {
        name: "Delhi",
        state: "New Delhi",
        description:
            "Delhi NCR's vibrant food and retail scene makes it perfect for Wi-Fi marketing. From Khan Market to Connaught Place, Mark Morph helps Delhi businesses grow their customer database.",
        businesses: [
            "Khan Market restaurants",
            "Connaught Place cafes",
            "Hauz Khas Village bars",
            "Gurgaon malls",
            "Noida food courts",
            "Greater Kailash boutiques",
        ],
        landmarks: ["Khan Market", "Connaught Place", "Hauz Khas", "Gurgaon", "Noida", "Greater Kailash"],
        stats: { cafes: "6,500+", restaurants: "20,000+", gyms: "950+" },
    },
    hyderabad: {
        name: "Hyderabad",
        state: "Telangana",
        description:
            "Hyderabad's booming IT sector and food culture create endless opportunities for Wi-Fi marketing. From Jubilee Hills to HITEC City, Mark Morph powers customer engagement.",
        businesses: [
            "HITEC City tech cafeterias",
            "Jubilee Hills fine dining",
            "Banjara Hills cafes",
            "Gachibowli gym chains",
            "Madhapur restaurants",
            "Secunderabad retail stores",
        ],
        landmarks: ["HITEC City", "Jubilee Hills", "Banjara Hills", "Gachibowli", "Madhapur", "Secunderabad"],
        stats: { cafes: "3,500+", restaurants: "10,000+", gyms: "600+" },
    },
    chennai: {
        name: "Chennai",
        state: "Tamil Nadu",
        description:
            "Chennai's traditional hospitality meets modern technology with Mark Morph. From T. Nagar shops to OMR tech hubs, capture every customer interaction.",
        businesses: [
            "OMR IT corridor cafeterias",
            "T. Nagar retail stores",
            "Anna Nagar restaurants",
            "Adyar cafes",
            "ECR beachside resorts",
            "Velachery fitness centers",
        ],
        landmarks: ["OMR", "T. Nagar", "Anna Nagar", "Adyar", "ECR", "Velachery"],
        stats: { cafes: "2,800+", restaurants: "8,500+", gyms: "450+" },
    },
    pune: {
        name: "Pune",
        state: "Maharashtra",
        description:
            "Pune's young, tech-savvy population loves staying connected. From Koregaon Park cafes to Hinjewadi IT parks, Mark Morph helps Pune businesses leverage Wi-Fi marketing.",
        businesses: [
            "Koregaon Park cafes",
            "FC Road restaurants",
            "Hinjewadi tech cafeterias",
            "Aundh fitness studios",
            "Kalyani Nagar bistros",
            "Camp area retail stores",
        ],
        landmarks: ["Koregaon Park", "FC Road", "Hinjewadi", "Aundh", "Kalyani Nagar", "Camp"],
        stats: { cafes: "2,200+", restaurants: "6,000+", gyms: "400+" },
    },
};

const businessTypes = [
    { icon: Coffee, name: "Cafes & Coffee Shops", color: "#9EE53B" },
    { icon: Utensils, name: "Restaurants & Bars", color: "#A855F7" },
    { icon: Dumbbell, name: "Gyms & Fitness Centers", color: "#E639D0" },
    { icon: ShoppingBag, name: "Retail Stores", color: "#28C5F5" },
    { icon: Building2, name: "Coworking Spaces", color: "#FFD93D" },
    { icon: Store, name: "Hotels & Resorts", color: "#FF6B6B" },
];

const features = [
    "Capture customer emails automatically",
    "Display targeted promotional ads",
    "Automate Google review requests",
    "Real-time analytics dashboard",
    "Branded splash page design",
    "No new hardware required",
];

export default function LocalLanding() {
    const [, setLocation] = useLocation();
    const params = useParams();
    const citySlug = (params as { city?: string }).city?.toLowerCase() || "bangalore";
    const city = cityData[citySlug] || cityData.bangalore;

    return (
        <div className="min-h-screen bg-white">
            {/* SEO - Highly optimized for local search */}
            <SEO
                title={`Wi-Fi Marketing for ${city.name} Businesses | Mark Morph`}
                description={`The #1 Wi-Fi advertising platform for cafes, restaurants, and gyms in ${city.name}, ${city.state}. Capture customer data, display ads, and boost Google reviews. Free setup.`}
                canonicalUrl={`/wifi-marketing/${citySlug}`}
                keywords={`Wi-Fi marketing ${city.name}, captive portal ${city.name}, guest wifi advertising ${city.state}, wifi ads for cafes ${city.name}, restaurant marketing ${city.name}, gym wifi marketing ${city.name}`}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": `Mark Morph - ${city.name}`,
                    "description": city.description,
                    "areaServed": {
                        "@type": "City",
                        "name": city.name,
                        "containedInPlace": {
                            "@type": "State",
                            "name": city.state,
                        },
                    },
                    "priceRange": "Free - ₹999/month",
                    "openingHours": "Mo-Su 00:00-24:00",
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
                            <MapPin className="w-4 h-4" />
                            {city.name}, {city.state}
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-display font-extrabold text-white leading-tight mb-6">
                            Wi-Fi Marketing for{" "}
                            <span className="text-[#222]">{city.name}</span> Businesses
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed mb-8">
                            {city.description}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={() => setLocation("/signup")}
                                className="h-14 px-8 text-lg font-bold rounded-full bg-[#222] text-white hover:bg-[#333] shadow-2xl"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setLocation("/how-it-works")}
                                className="h-14 px-8 text-lg font-bold rounded-full bg-white/10 text-white border-2 border-white/30 hover:bg-white/20"
                            >
                                How It Works
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-4xl font-display font-bold text-[#9EE53B] mb-2">
                                {city.stats.cafes}
                            </div>
                            <div className="text-gray-600">Cafes in {city.name}</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="text-4xl font-display font-bold text-[#A855F7] mb-2">
                                {city.stats.restaurants}
                            </div>
                            <div className="text-gray-600">Restaurants in {city.name}</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="text-4xl font-display font-bold text-[#E639D0] mb-2">
                                {city.stats.gyms}
                            </div>
                            <div className="text-gray-600">Gyms in {city.name}</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Business Types Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                            Perfect for Every {city.name} Business
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Whether you run a cafe in {city.landmarks[0]} or a gym in {city.landmarks[3]},
                            Mark Morph helps you capture customer data and grow your business.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businessTypes.map((type, index) => (
                            <motion.div
                                key={type.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group cursor-pointer"
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${type.color}20` }}
                                >
                                    <type.icon className="w-7 h-7" style={{ color: type.color }} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {type.name}
                                </h3>
                                <p className="text-gray-600">
                                    Capture customer emails and display promotions when guests connect to your Wi-Fi.
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Local Areas Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                            Serving Businesses Across {city.name}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            From {city.landmarks[0]} to {city.landmarks[5]}, Mark Morph powers
                            Wi-Fi marketing for businesses in every corner of {city.name}.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {city.businesses.map((business, index) => (
                            <motion.div
                                key={business}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
                                <CheckCircle2 className="w-5 h-5 text-[#9EE53B] flex-shrink-0" />
                                <span className="text-gray-700">{business}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-6">
                                Everything You Need to Grow Your {city.name} Business
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Mark Morph gives you powerful tools to turn every Wi-Fi connection
                                into a growth opportunity. No technical skills required.
                            </p>
                            <ul className="space-y-4">
                                {features.map((feature, index) => (
                                    <motion.li
                                        key={feature}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-6 h-6 text-[#9EE53B]" />
                                        <span className="text-gray-700 text-lg">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#9EE53B]/20 to-[#A855F7]/20 p-8 flex items-center justify-center">
                                <div className="text-center">
                                    <Wifi className="w-32 h-32 text-[#9EE53B] mx-auto mb-4" />
                                    <div className="text-2xl font-display font-bold text-gray-900">
                                        Free Wi-Fi = Free Marketing
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-20 bg-[#222]">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="flex justify-center gap-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-8 h-8 text-[#FFD93D] fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-2xl text-white font-medium mb-6">
                            "Mark Morph helped us collect over 5,000 customer emails in just 3 months.
                            Our Google reviews went from 3.8 to 4.6 stars. Best investment we've made!"
                        </blockquote>
                        <div className="text-white/70">
                            — Cafe Owner, {city.landmarks[0]}, {city.name}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-6">
                            Ready to Grow Your {city.name} Business?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join hundreds of {city.name} businesses already using Mark Morph.
                            Setup takes just 5 minutes. No credit card required.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={() => setLocation("/signup")}
                                className="h-14 px-10 text-lg font-bold rounded-full bg-[#9EE53B] text-[#222] hover:bg-[#8BD42E] shadow-xl"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-10 text-lg font-bold rounded-full border-2 border-gray-300 hover:bg-gray-100"
                            >
                                <Phone className="mr-2 w-5 h-5" />
                                Contact Sales
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Other Cities Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Also Available In
                        </h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.entries(cityData)
                            .filter(([slug]) => slug !== citySlug)
                            .map(([slug, data]) => (
                                <Button
                                    key={slug}
                                    variant="ghost"
                                    onClick={() => setLocation(`/wifi-marketing/${slug}`)}
                                    className="text-gray-600 hover:text-[#9EE53B]"
                                >
                                    {data.name}
                                </Button>
                            ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
