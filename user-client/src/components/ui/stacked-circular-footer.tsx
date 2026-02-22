import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Instagram, Facebook } from "lucide-react"
import Image from "next/image"
import { Icons } from "@/components/ui/icons"

function StackedCircularFooter() {
    return (
        <footer className="bg-background py-12 border-t">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center">
                    <div className="mb-8 rounded-full bg-primary/10 p-8">
                        <Image
                            src="/black-logo.png"
                            alt="LinkBeet Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                            priority
                        />

                    </div>
                    <nav className="mb-8 flex flex-wrap justify-center gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="/near-me" className="hover:text-primary transition-colors font-semibold text-primary">Near Me</Link>
                        <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
                        <Link href="/#how-it-works" className="hover:text-primary transition-colors">How it works</Link>
                        <Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    </nav>
                    <div className="mb-8 flex space-x-4">
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link href="https://www.instagram.com/linkbe.et" target="_blank" rel="noopener noreferrer">
                                <Instagram className="h-4 w-4" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link href="https://www.facebook.com/Linkbeet/" target="_blank" rel="noopener noreferrer">
                                <Facebook className="h-4 w-4" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link href="https://x.com/Linkbeet" target="_blank" rel="noopener noreferrer">
                                <Icons.x className="h-4 w-4 fill-current" />
                                <span className="sr-only">X (Twitter)</span>
                            </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link href="mailto:linkbeet@gmail.com">
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">Email</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} LinkBeet. All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Crafted by LinkBeet Team
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export { StackedCircularFooter }
