import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    canonicalUrl?: string;
    type?: 'website' | 'article' | 'profile';
    noIndex?: boolean;
    structuredData?: object;
}

/**
 * SEO Component for MARK MORPH
 * 
 * Handles dynamic meta tags, Open Graph, Twitter Cards, and structured data.
 * Optimized for Wi-Fi Advertising Platform, Captive Portal Marketing keywords.
 */
export function SEO({
    title,
    description,
    keywords = 'Wi-Fi Advertising Platform, Captive Portal Marketing, Free Wi-Fi for Businesses, Digital Hotspot Ads, Customer Analytics, Google Review Automation',
    image = '/ms-icon-310x310.png',
    canonicalUrl,
    type = 'website',
    noIndex = false,
    structuredData,
}: SEOProps) {
    const siteName = 'Mark Morph';
    const siteUrl = 'https://www.markmorph.in';
    const fullTitle = title.includes('MARK MORPH') ? title : `${title} | ${siteName}`;
    const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
    const fullCanonicalUrl = canonicalUrl ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${siteUrl}${canonicalUrl}`) : undefined;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Helper to update or create meta tags
        const setMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, name);
                document.head.appendChild(tag);
            }
            tag.content = content;
        };

        // Primary Meta Tags
        setMeta('description', description);
        setMeta('keywords', keywords);
        setMeta('author', 'MARK MORPH');

        // Robots
        if (noIndex) {
            setMeta('robots', 'noindex, nofollow');
        } else {
            setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        }

        // Open Graph Tags
        setMeta('og:type', type, true);
        setMeta('og:title', fullTitle, true);
        setMeta('og:description', description, true);
        setMeta('og:image', fullImageUrl, true);
        setMeta('og:site_name', siteName, true);
        setMeta('og:locale', 'en_IN', true);
        if (fullCanonicalUrl) {
            setMeta('og:url', fullCanonicalUrl, true);
        }

        // Twitter Card Tags
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', fullTitle);
        setMeta('twitter:description', description);
        setMeta('twitter:image', fullImageUrl);
        setMeta('twitter:site', '@markmorph_in');

        // Canonical URL
        let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (fullCanonicalUrl) {
            if (!canonicalTag) {
                canonicalTag = document.createElement('link');
                canonicalTag.rel = 'canonical';
                document.head.appendChild(canonicalTag);
            }
            canonicalTag.href = fullCanonicalUrl;
        } else if (canonicalTag) {
            canonicalTag.remove();
        }

        // Structured Data (JSON-LD)
        if (structuredData) {
            let jsonLdTag = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
            if (!jsonLdTag) {
                jsonLdTag = document.createElement('script');
                jsonLdTag.type = 'application/ld+json';
                jsonLdTag.setAttribute('data-seo-jsonld', 'true');
                document.head.appendChild(jsonLdTag);
            }
            jsonLdTag.textContent = JSON.stringify(structuredData);
        }

        // Cleanup function
        return () => {
            // Reset to defaults on unmount (optional, prevents stale meta tags)
        };
    }, [fullTitle, description, keywords, fullImageUrl, fullCanonicalUrl, type, noIndex, structuredData]);

    return null; // This component doesn't render anything visible
}

// Pre-defined SEO configurations for main pages
export const SEO_CONFIG = {
    homepage: {
        title: 'Turn Free Wi-Fi Into Sales | MARK MORPH',
        description: 'Transform your guest Wi-Fi into a powerful marketing engine. Capture leads, display targeted ads, and boost Google reviews. Zero hardware cost. Setup in 5 minutes.',
        keywords: 'Wi-Fi Advertising Platform, Captive Portal Marketing, Free Wi-Fi for Businesses, Digital Hotspot Ads, Customer Analytics for Restaurants, Monetize Guest Wi-Fi, Google Review Automation, Small Business Marketing Tools, MARK MORPH Wi-Fi',
        canonicalUrl: '/',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'MARK MORPH',
            'applicationCategory': 'BusinessApplication',
            'operatingSystem': 'Web',
            'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'INR'
            },
            'description': 'Smart Wi-Fi marketing platform that transforms guest Wi-Fi into a powerful sales and analytics tool for businesses.',
            'author': {
                '@type': 'Organization',
                'name': 'MARK MORPH',
                'url': 'https://www.markmorph.in'
            },
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.8',
                'reviewCount': '150'
            }
        }
    },
    dashboard: {
        title: 'Business Insights & Ad Manager | MARK MORPH',
        description: 'Access real-time customer analytics, manage Wi-Fi ad campaigns, and track Google review performance. Your complete business dashboard.',
        keywords: 'Business Dashboard, Customer Analytics, Ad Campaign Manager, Wi-Fi Marketing Analytics, Real-time Insights, MARK MORPH Dashboard',
        canonicalUrl: '/dashboard',
        noIndex: false,
    },
    businessProfile: {
        title: 'Customize Your Brand | MARK MORPH',
        description: 'Set up your business profile, upload branded banners, and create an engaging splash page for your guests. Make every Wi-Fi connection count.',
        keywords: 'Business Profile Setup, Brand Customization, Splash Page Design, Wi-Fi Branding, Guest Experience, MARK MORPH Business',
        canonicalUrl: '/profile',
    },
    splash: {
        title: 'Connect to Free Wi-Fi',
        description: 'Verified access to free Wi-Fi. Connect instantly and securely.',
        noIndex: true, // Important: Prevent indexing of guest sessions
        keywords: 'Free Wi-Fi, Guest Wi-Fi Access, Instant Connection',
    },
    login: {
        title: 'Sign In to Your Account | MARK MORPH',
        description: 'Access your MARK MORPH dashboard to manage Wi-Fi marketing campaigns, view analytics, and grow your business.',
        canonicalUrl: '/login',
    },
    signup: {
        title: 'Get Started Free | MARK MORPH',
        description: 'Create your free MARK MORPH account and start converting guest Wi-Fi into a marketing powerhouse. No credit card required.',
        canonicalUrl: '/signup',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Sign Up for MARK MORPH',
            'description': 'Create a free account to start your Wi-Fi marketing journey.',
            'potentialAction': {
                '@type': 'RegisterAction',
                'target': 'https://www.markmorph.in/signup'
            }
        }
    }
};

// Long-tail Keywords for Indian Market
export const INDIA_LONG_TAIL_KEYWORDS = [
    'Best Wi-Fi marketing for cafes in Bangalore',
    'Free guest Wi-Fi solution for restaurants Mumbai',
    'Captive portal advertising for hotels Delhi',
    'Wi-Fi marketing platform for small businesses India',
    'Google review automation for restaurants Pune',
    'Digital hotspot ads for shopping malls Chennai',
    'Guest Wi-Fi analytics for coworking spaces Hyderabad',
    'Wi-Fi advertising for retail stores Kolkata',
    'Customer data capture through Wi-Fi Ahmedabad',
    'Monetize cafe Wi-Fi India',
    'Free Wi-Fi marketing tool for Indian SMBs',
    'Captive portal solution for Indian hospitality',
    'Wi-Fi splash page design for restaurants India',
    'Guest engagement platform for hotels India',
    'Wi-Fi based customer loyalty program India',
    'Real-time analytics for restaurant Wi-Fi Jaipur',
    'Digital marketing through guest Wi-Fi Lucknow',
    'Wi-Fi advertising ROI for Indian businesses',
    'Best captive portal software for Indian cafes',
    'Cloud-based Wi-Fi marketing platform India'
];

export default SEO;
