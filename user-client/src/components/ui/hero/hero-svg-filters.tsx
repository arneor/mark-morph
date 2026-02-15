export function HeroSVGFilters() {
    return (
        <svg className="absolute inset-0 w-0 h-0">
            <defs>
                <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
                    <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
                    <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 0.02
                  0 1 0 0 0.02
                  0 0 1 0 0.05
                  0 0 0 0.9 0"
                        result="tint"
                    />
                </filter>
                <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                        result="gooey"
                    />
                    <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
                </filter>
                <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
                <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#06b6d4" />
                    <stop offset="70%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
        </svg>
    )
}
