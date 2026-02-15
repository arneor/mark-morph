import { HeroBackground } from "./hero/hero-background"
import { HeroContent } from "./hero/hero-content"
import { HeroHeader } from "./hero/hero-header"
import { HeroWidget } from "./hero/hero-widget"
import { HeroSVGFilters } from "./hero/hero-svg-filters"

export default function ShaderShowcase() {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            <HeroSVGFilters />
            <HeroBackground />
            <HeroHeader />
            <HeroContent />
            <HeroWidget />
        </div>
    )
}
