// Tree Profile type definitions
// Extracted from dummyTreeProfileData.ts for use across the app

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
    s3Key?: string;
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
    templateId?: string;
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor: string;
    backgroundType: 'solid' | 'gradient' | 'animated' | 'image' | 'video';
    backgroundValue: string;
    textColor: string;
    fontFamily: string;
    buttonStyle: 'rounded' | 'pill' | 'sharp' | 'soft' | 'glass';
    cardStyle: 'glass' | 'solid' | 'outline' | 'minimal' | 'flat';
}

export interface TreeProfileData {
    businessName: string;
    tagline: string;
    description?: string;
    location?: string;
    profileImage: string;
    bannerImage?: string;
    coverUrl?: string;
    avatarUrl?: string;
    isVerified: boolean;
    sectionTitle: string;
    linksTitle: string;
    openingHours?: {
        start: string;
        end: string;
    };
    theme: TreeProfileTheme;
    socialLinks: SocialLink[];
    customLinks: CustomLink[];
    categories: CatalogCategory[];
    catalogItems: CatalogItem[];
    banners?: ProfileBanner[];
    gallery?: ProfileGalleryImage[];
    reviews?: ProfileReview[];
}

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
        primaryColor: '#D4AF37',
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
        primaryColor: '#EC4899',
        backgroundColor: '#FDF2F8',
        backgroundType: 'gradient' as const,
        backgroundValue: 'linear-gradient(to bottom right, #FDF2F8, #FFF1F2)',
        textColor: '#831843',
        fontFamily: 'Playfair Display',
        buttonStyle: 'soft' as const,
        cardStyle: 'flat' as const,
    },
    'power-gym': {
        id: 'power-gym',
        name: 'Power Gym',
        type: 'Business',
        primaryColor: '#EF4444',
        backgroundColor: '#000000',
        backgroundType: 'image' as const,
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
        primaryColor: '#F59E0B',
        backgroundColor: '#1c1917',
        backgroundType: 'gradient' as const,
        backgroundValue: 'linear-gradient(to bottom, #1c1917, #000000)',
        textColor: '#FEF3C7',
        fontFamily: 'DM Sans',
        buttonStyle: 'rounded' as const,
        cardStyle: 'minimal' as const,
    }
};

export const themePresets = {
    coffeeShop: TEMPLATES['midnight-blur'],
    salon: TEMPLATES['modern-salon'],
    gym: TEMPLATES['power-gym'],
    restaurant: TEMPLATES['gourmet-eats'],
};
