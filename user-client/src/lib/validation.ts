
/**
 * Social Platform validation config.
 * All URL regexes allow optional trailing paths and query parameters
 * (e.g. ?igsh=..., ?utm_source=...) to support mobile share links.
 */
export const SOCIAL_PLATFORMS = {
    instagram: {
        id: 'instagram',
        label: 'Instagram',
        baseUrl: 'instagram.com/',
        regex: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
        placeholder: 'https://instagram.com/username',
    },
    facebook: {
        id: 'facebook',
        label: 'Facebook',
        baseUrl: 'facebook.com/',
        regex: /^(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/([a-zA-Z0-9.]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
        placeholder: 'https://facebook.com/username',
    },
    twitter: {
        id: 'twitter',
        label: 'Twitter',
        baseUrl: 'twitter.com/',
        regex: /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
        placeholder: 'https://twitter.com/username',
    },
    youtube: {
        id: 'youtube',
        label: 'YouTube',
        baseUrl: 'youtube.com/',
        regex: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:channel\/|c\/|user\/|@|shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
        placeholder: 'https://youtube.com/@channel',
    },
    linkedin: {
        id: 'linkedin',
        label: 'LinkedIn',
        baseUrl: 'linkedin.com/',
        regex: /^(?:https?:\/\/)?(?:[a-z]{2}\.)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9_-]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
        placeholder: 'https://linkedin.com/in/username',
    },
    tiktok: {
        id: 'tiktok',
        label: 'TikTok',
        baseUrl: 'tiktok.com/',
        regex: /^(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com)\/@?([a-zA-Z0-9_.]+)(?:\/[^?]*)?(\?[^\s]*)?\/?$/,
        placeholder: 'https://tiktok.com/@username',
    },
    whatsapp: {
        id: 'whatsapp',
        label: 'WhatsApp',
        baseUrl: 'wa.me/',
        regex: /^(?:https?:\/\/)?(?:www\.)?(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)(\+?\d+)(\?[^\s]*)?/,
        placeholder: 'https://wa.me/1234567890',
    },
    email: {
        id: 'email',
        label: 'Email',
        baseUrl: 'mailto:',
        regex: /^(?:mailto:)?([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        placeholder: 'hello@example.com',
    },
    phone: {
        id: 'phone',
        label: 'Phone',
        baseUrl: 'tel:',
        regex: /^(?:tel:)?\+?([0-9\s()-]{7,})$/,
        placeholder: '+1234567890',
    },
};

export interface ValidationResult {
    isValid: boolean;
    formattedUrl: string;
    error?: string;
}

export function validateSocialLink(platform: string, urlOrHandle: string): ValidationResult {
    const config = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS];

    if (!config) {
        // Fallback for unknown platforms or if platform list changes
        try {
            const url = new URL(urlOrHandle.startsWith('http') ? urlOrHandle : `https://${urlOrHandle}`);
            return { isValid: true, formattedUrl: url.toString() };
        } catch {
            return { isValid: false, formattedUrl: urlOrHandle, error: 'Invalid URL format' };
        }
    }

    // Email special case
    if (platform === 'email') {
        if (config.regex.test(urlOrHandle)) {
            return { isValid: true, formattedUrl: `mailto:${urlOrHandle}` };
        }
        // Check if it already has mailto:
        const clean = urlOrHandle.replace(/^mailto:/, '');
        if (config.regex.test(clean)) {
            return { isValid: true, formattedUrl: urlOrHandle };
        }
        return { isValid: false, formattedUrl: urlOrHandle, error: 'Invalid email address' };
    }

    // Phone special case
    if (platform === 'phone') {
        const clean = urlOrHandle.replace(/^tel:/, '').trim();
        if (config.regex.test(clean)) {
            // Strip spaces/dashes/parens for the tel: URI, keep + prefix
            const normalized = clean.replace(/[\s()-]/g, '');
            return { isValid: true, formattedUrl: `tel:${normalized}` };
        }
        return { isValid: false, formattedUrl: urlOrHandle, error: 'Invalid phone number' };
    }

    // Standard URL platforms
    let input = urlOrHandle.trim();

    // 1. Check if full URL matches regex
    if (config.regex.test(input)) {
        // Ensure protocol
        if (!input.startsWith('http')) {
            input = `https://${input}`;
        }
        return { isValid: true, formattedUrl: input };
    }

    // 2. Check if it's just a username/handle (doesn't contain domain)
    // We assume if it doesn't match the full URL regex, and doesn't look like a URL (no dots/slashes), it might be a handle.
    // But strictly, we should just prepend base URL and see.

    // Naive check: if it contains the domain, it likely failed regex because of malformed path.
    // If it does NOT contain domain, assume it's a handle.
    const domain = config.baseUrl.split('/')[0];
    if (!input.includes(domain) && !input.startsWith('http')) {
        // Treat as handle
        // Strip @ if present for some platforms (e.g. tiktok, youtube, twitter)
        const handle = input;
        // Re-construct URL
        let formattedUrl = `https://${config.baseUrl}${handle}`;

        // Fix double slashes if baseUrl has one (e.g. instagram.com/) and we added one? No, config.baseUrl has trailing slash usually.
        // But let's be careful.
        if (platform === 'whatsapp') {
            // WhatsApp input "123456" -> https://wa.me/123456
            formattedUrl = `https://${config.baseUrl}${handle}`;
        } else if (platform === 'tiktok' && !handle.startsWith('@')) {
            // Tiktok handles often have @, but url is tiktok.com/@handle
            formattedUrl = `https://${config.baseUrl}@${handle}`;
        } else {
            formattedUrl = `https://${config.baseUrl}${handle}`;
        }

        // Validate the constructed URL against regex
        if (config.regex.test(formattedUrl)) {
            return { isValid: true, formattedUrl };
        }
    }

    return { isValid: false, formattedUrl: input, error: `Invalid ${config.label} URL or handle` };
}

/**
 * Detects if a string looks like a phone number.
 * Matches: +1234567890, 1234567890, (123) 456-7890, +91 98765 43210
 */
export function isPhoneNumber(input: string): boolean {
    const cleaned = input.trim();
    // Must start with + or digit, contain mostly digits, min 7 digit chars
    if (!/^[+\d]/.test(cleaned)) return false;
    const digitsOnly = cleaned.replace(/[^\d]/g, '');
    // 7-15 digits is the valid international phone number range (ITU-T E.164)
    return digitsOnly.length >= 7 && digitsOnly.length <= 15 && /^[+\d\s()-]+$/.test(cleaned);
}

/**
 * Validates a generic URL or "Smart Link" (auto-detects phone numbers, mailto, tel).
 * - Pure numeric / phone pattern → auto-prefix with tel:
 * - Email pattern → auto-prefix with mailto:
 * - Standard URLs → ensure https:// protocol
 * - XSS prevention: blocks javascript: protocol
 */
export function validateGenericUrl(url: string): ValidationResult {
    const trimmed = url.trim();

    if (!trimmed) {
        return { isValid: false, formattedUrl: url, error: 'URL is required' };
    }

    // XSS Prevention: Block dangerous protocols
    if (/^\s*javascript:/i.test(trimmed)) {
        return { isValid: false, formattedUrl: url, error: 'Invalid URL format' };
    }

    // Smart Link: Phone number detection
    if (isPhoneNumber(trimmed)) {
        const normalized = trimmed.replace(/[\s()-]/g, '');
        return { isValid: true, formattedUrl: `tel:${normalized}` };
    }

    // Smart Link: Already a tel: link
    if (/^tel:/i.test(trimmed)) {
        return { isValid: true, formattedUrl: trimmed };
    }

    // Smart Link: Already a mailto: link
    if (/^mailto:/i.test(trimmed)) {
        return { isValid: true, formattedUrl: trimmed };
    }

    // Smart Link: Bare email address
    if (/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
        return { isValid: true, formattedUrl: `mailto:${trimmed}` };
    }

    try {
        // Ensure protocol
        const urlWithProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const parsed = new URL(urlWithProtocol);
        return { isValid: true, formattedUrl: parsed.toString() };
    } catch {
        return { isValid: false, formattedUrl: url, error: 'Invalid URL format' };
    }
}
