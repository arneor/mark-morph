
// Dummy data for Tree Profile page - a Coffee Shop example
// This provides comprehensive mock data for UI development

export interface SocialLink {
    id: string;
    platform: 'instagram' | 'facebook' | 'whatsapp' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin' | 'email' | 'phone';
    url: string;
    label?: string;
}

export interface CustomLink {
    id: string;
    title: string;
    url: string;
    description?: string;
    icon?: string;
    style: 'default' | 'featured' | 'outline' | 'gradient';
    isActive: boolean;
}

export interface CatalogCategory {
    id: string;
    name: string;
    emoji?: string;
}

export interface CatalogItem {
    id: string;
    categoryId: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    tags?: ('bestseller' | 'new' | 'veg' | 'non-veg' | 'spicy' | 'featured')[];
    isAvailable: boolean;
}

export interface ProfileBanner {
    id: string;
    imageUrl: string;
    title?: string;
    linkUrl?: string;
    isActive: boolean;
}

export interface ProfileGalleryImage {
    id: string;
    imageUrl: string;
    caption?: string;
}

export interface ProfileReview {
    id: string;
    reviewerName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    avatarUrl?: string;
}

export interface TreeProfileTheme {
    templateId?: string; // To track if a standard template is active
    primaryColor: string;
    secondaryColor?: string; // New: Secondary accent
    backgroundColor: string;
    backgroundType: 'solid' | 'gradient' | 'animated' | 'image' | 'video'; // Expanded types
    backgroundValue: string; // Hex, gradient string, or image/video URL
    textColor: string;
    fontFamily: string;
    buttonStyle: 'rounded' | 'pill' | 'sharp' | 'soft' | 'glass'; // Expanded styles
    cardStyle: 'glass' | 'solid' | 'outline' | 'minimal' | 'flat'; // New: Card styling
}

export interface TreeProfileData {
    businessName: string;
    tagline: string;
    description?: string;
    location?: string;
    profileImage: string;
    bannerImage?: string;
    coverUrl?: string; // Deprecated
    avatarUrl?: string; // Deprecated
    isVerified: boolean;
    sectionTitle: string;
    linksTitle: string;
    theme: TreeProfileTheme;
    socialLinks: SocialLink[];
    customLinks: CustomLink[];
    categories: CatalogCategory[];

    catalogItems: CatalogItem[];
    banners?: ProfileBanner[];
    gallery?: ProfileGalleryImage[];
    reviews?: ProfileReview[];
}

// Sample Coffee Shop Data
export const dummyTreeProfileData: TreeProfileData = {
    businessName: "The Brew House",
    tagline: "Crafted with passion, served with love ☕",
    description: "Premium specialty coffee & artisan pastries in the heart of the city. We source the finest beans from around the world.",
    location: "123 Coffee Lane, Downtown",
    profileImage: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2671&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671&auto=format&fit=crop", // Coffee shop interior
    avatarUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2671&auto=format&fit=crop",
    coverUrl: "",
    isVerified: true,
    sectionTitle: "✨ Our Menu",
    linksTitle: "🔗 Quick Links",
    theme: {
        templateId: 'clean-minimal',
        primaryColor: "#000000",
        backgroundColor: "#FFFFFF",
        backgroundType: 'solid',
        backgroundValue: '#FFFFFF',
        textColor: '#0f172a', // Dark text for clean minimal
        fontFamily: 'Inter',
        buttonStyle: 'sharp',
        cardStyle: 'flat',
    },
    socialLinks: [
        { id: "1", platform: "instagram", url: "https://instagram.com/thebrewhouse", label: "@thebrewhouse" },
        { id: "2", platform: "facebook", url: "https://facebook.com/thebrewhouse" },
        { id: "3", platform: "whatsapp", url: "https://wa.me/919876543210", label: "+91 98765 43210" },
        { id: "4", platform: "twitter", url: "https://twitter.com/thebrewhouse" },
        { id: "5", platform: "youtube", url: "https://youtube.com/@thebrewhouse" },
    ],
    customLinks: [
        {
            id: "link1",
            title: "📍 Get Directions",
            url: "https://maps.google.com/?q=The+Brew+House",
            description: "Find us easily on Google Maps",
            style: "featured",
            isActive: true,
        },
        {
            id: "link2",
            title: "📅 Book a Table",
            url: "https://booking.thebrewhouse.com",
            description: "Reserve your spot",
            style: "gradient",
            isActive: true,
        },
        {
            id: "link3",
            title: "🎁 Loyalty Rewards",
            url: "https://rewards.thebrewhouse.com",
            description: "Earn points on every purchase",
            style: "default",
            isActive: true,
        },
        {
            id: "link4",
            title: "💼 Franchise Inquiry",
            url: "https://franchise.thebrewhouse.com",
            style: "outline",
            isActive: true,
        },
        {
            id: "link5",
            title: "📝 Leave a Review",
            url: "https://g.page/thebrewhouse/review",
            style: "default",
            isActive: true,
        },
    ],
    banners: [
        {
            id: "banner1",
            imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=2670&auto=format&fit=crop",
            title: "50% OFF on First Order",
            isActive: true,
            linkUrl: "#"
        },
        {
            id: "banner2",
            imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2574&auto=format&fit=crop",
            title: "New Summer Menu",
            isActive: true,
            linkUrl: "#"
        }
    ],
    gallery: [
        { id: "g1", imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80", caption: "Latte Art Perfection" },
        { id: "g2", imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80", caption: "Cozy Corner" },
        { id: "g3", imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80", caption: "Morning Brew" },
        { id: "g4", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", caption: "Coffee Time" },
        { id: "g5", imageUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80", caption: "Delicious Pastries" },
        { id: "g6", imageUrl: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80", caption: "Fresh Croissants" },
        { id: "g7", imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80", caption: "Espresso Shot" },
        { id: "g8", imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80", caption: "Sweet Treats" },
    ],
    reviews: [
        {
            id: "r1",
            reviewerName: "Alex Johnson",
            rating: 5,
            comment: "Best coffee in town! The ambiance is amazing.",
            date: "2 days ago",
            avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            id: "r2",
            reviewerName: "Sarah Smith",
            rating: 4,
            comment: "Loved the pastries. Coffee was a bit strong for me though.",
            date: "1 week ago",
            avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
        }
    ],
    categories: [
        { id: "cat1", name: "Hot Beverages", emoji: "☕" },
        { id: "cat2", name: "Cold Brews", emoji: "🧊" },
        { id: "cat3", name: "Pastries & Snacks", emoji: "🥐" },
        { id: "cat4", name: "Specialty Drinks", emoji: "✨" },
    ],
    catalogItems: [
        // Hot Beverages
        {
            id: "item1",
            categoryId: "cat1",
            title: "Classic Espresso",
            description: "Rich, intense shot of our signature blend",
            price: 149,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=400&fit=crop",
            tags: ["bestseller"],
            isAvailable: true,
        },
        {
            id: "item2",
            categoryId: "cat1",
            title: "Caramel Latte",
            description: "Smooth espresso with steamed milk and caramel drizzle",
            price: 249,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
            tags: ["featured"],
            isAvailable: true,
        },
        {
            id: "item3",
            categoryId: "cat1",
            title: "Cappuccino",
            description: "Perfect balance of espresso, steamed milk, and foam",
            price: 199,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop",
            isAvailable: true,
        },
        {
            id: "item4",
            categoryId: "cat1",
            title: "Matcha Latte",
            description: "Premium Japanese matcha with creamy oat milk",
            price: 279,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=400&fit=crop",
            tags: ["new", "veg"],
            isAvailable: true,
        },
        // Cold Brews
        {
            id: "item5",
            categoryId: "cat2",
            title: "Classic Cold Brew",
            description: "18-hour steeped for smooth, bold flavor",
            price: 199,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop",
            tags: ["bestseller"],
            isAvailable: true,
        },
        {
            id: "item6",
            categoryId: "cat2",
            title: "Iced Mocha",
            description: "Espresso, chocolate, milk over ice",
            price: 249,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=400&fit=crop",
            isAvailable: true,
        },
        {
            id: "item7",
            categoryId: "cat2",
            title: "Vietnamese Coffee",
            description: "Strong coffee with sweetened condensed milk",
            price: 229,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop",
            tags: ["featured"],
            isAvailable: true,
        },
        // Pastries
        {
            id: "item8",
            categoryId: "cat3",
            title: "Butter Croissant",
            description: "Flaky, buttery layers of perfection",
            price: 149,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop",
            tags: ["bestseller", "veg"],
            isAvailable: true,
        },
        {
            id: "item9",
            categoryId: "cat3",
            title: "Chocolate Muffin",
            description: "Double chocolate indulgence",
            price: 129,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop",
            tags: ["veg"],
            isAvailable: true,
        },
        {
            id: "item10",
            categoryId: "cat3",
            title: "Avocado Toast",
            description: "Smashed avo on sourdough with cherry tomatoes",
            price: 299,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop",
            tags: ["new", "veg"],
            isAvailable: true,
        },
        // Specialty
        {
            id: "item11",
            categoryId: "cat4",
            title: "Lavender Honey Latte",
            description: "Floral notes meet sweet honey",
            price: 299,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop",
            tags: ["new", "featured"],
            isAvailable: true,
        },
        {
            id: "item12",
            categoryId: "cat4",
            title: "Rose Cardamom",
            description: "Indian-inspired aromatic experience",
            price: 279,
            currency: "₹",
            imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=400&fit=crop",
            tags: ["bestseller"],
            isAvailable: true,
        },
    ],
};

// Premium Template Definitions
export const TEMPLATES = {
    'midnight-blur': {
        id: 'midnight-blur',
        name: 'Midnight Blur',
        type: 'Premium',
        primaryColor: '#9EE53B',
        backgroundColor: '#0f172a',
        backgroundType: 'animated' as const,
        backgroundValue: 'linear-gradient(-45deg, #0f172a, #331029, #0f2e2e, #1a0b2e)',
        textColor: '#FFFFFF',
        fontFamily: 'Outfit',
        buttonStyle: 'rounded' as const,
        cardStyle: 'glass' as const,
    },
    'clean-minimal': {
        id: 'clean-minimal',
        name: 'Clean Minimal',
        type: 'Classic',
        primaryColor: '#000000',
        backgroundColor: '#FFFFFF',
        backgroundType: 'solid' as const,
        backgroundValue: '#FFFFFF',
        textColor: '#0f172a',
        fontFamily: 'Inter',
        buttonStyle: 'sharp' as const,
        cardStyle: 'flat' as const,
    },
    'luxury-gold': {
        id: 'luxury-gold',
        name: 'Luxury Gold',
        type: 'Elegant',
        primaryColor: '#D4AF37', // Gold
        backgroundColor: '#050505',
        backgroundType: 'gradient' as const,
        backgroundValue: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
        textColor: '#F5F5F5',
        fontFamily: 'Playfair Display',
        buttonStyle: 'soft' as const,
        cardStyle: 'outline' as const,
    },
    'neon-cyber': {
        id: 'neon-cyber',
        name: 'Neon Cyber',
        type: 'Vibrant',
        primaryColor: '#00FF9D',
        backgroundColor: '#09090b',
        backgroundType: 'animated' as const,
        // Changed to dark gradient for better visibility
        backgroundValue: 'linear-gradient(135deg, #050505 0%, #1a0b2e 50%, #000000 100%)',
        textColor: '#FFFFFF',
        fontFamily: 'Space Grotesk',
        buttonStyle: 'glass' as const,
        cardStyle: 'glass' as const,
    },
    'modern-salon': {
        id: 'modern-salon',
        name: 'Modern Salon',
        type: 'Business',
        primaryColor: '#EC4899', // Pink-500
        backgroundColor: '#FDF2F8', // Pink-50
        backgroundType: 'gradient' as const,
        backgroundValue: 'linear-gradient(to bottom right, #FDF2F8, #FFF1F2)',
        textColor: '#831843', // Pink-900
        fontFamily: 'Playfair Display',
        buttonStyle: 'soft' as const,
        cardStyle: 'flat' as const,
    },
    'power-gym': {
        id: 'power-gym',
        name: 'Power Gym',
        type: 'Business',
        primaryColor: '#EF4444', // Red-500
        backgroundColor: '#000000',
        backgroundType: 'image' as const,
        // Dark gym background
        backgroundValue: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop',
        textColor: '#FFFFFF',
        fontFamily: 'Inter',
        buttonStyle: 'sharp' as const,
        cardStyle: 'solid' as const,
    },
    'gourmet-eats': {
        id: 'gourmet-eats',
        name: 'Gourmet Eats',
        type: 'Business',
        primaryColor: '#F59E0B', // Amber-500
        backgroundColor: '#1c1917', // Warm grey
        backgroundType: 'gradient' as const,
        backgroundValue: 'linear-gradient(to bottom, #1c1917, #000000)',
        textColor: '#FEF3C7', // Amber-100
        fontFamily: 'DM Sans',
        buttonStyle: 'rounded' as const,
        cardStyle: 'minimal' as const,
    }
};

// Deprecated presets kept for reference if needed, but TEMPLATES is the new source
export const themePresets = {
    coffeeShop: TEMPLATES['midnight-blur'],
    salon: TEMPLATES['modern-salon'],
    gym: TEMPLATES['power-gym'],
    restaurant: TEMPLATES['gourmet-eats'],
};
