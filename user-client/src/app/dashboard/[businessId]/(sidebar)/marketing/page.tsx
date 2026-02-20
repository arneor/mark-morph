'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import { Download, Link } from 'lucide-react';
import { useBusiness } from '@/hooks/use-businesses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function MarketingPage() {
    const params = useParams();
    const businessId = params.businessId as string;
    const { data: business } = useBusiness(businessId);
    const { toast } = useToast();

    const qrRef = useRef<HTMLDivElement>(null);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    useEffect(() => {
        const imageUrl = business?.profileImage || business?.logoUrl;
        if (!imageUrl) return;

        if (imageUrl.startsWith('data:')) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLogoDataUrl(imageUrl);
            return;
        }

        // Fetch image through Next.js proxy to avoid CORS, and convert to base64 
        // purely so html-to-image can smoothly bake it into the drawing canvas without cross-origin blocks.
        const proxyUrl = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=256&q=75`;

        fetch(proxyUrl)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoDataUrl(reader.result as string);
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                console.error("Failed to preload marketing logo:", err);
            });
    }, [business?.profileImage, business?.logoUrl]);

    const handleDownload = useCallback(() => {
        if (qrRef.current === null) {
            return;
        }

        toast({
            title: 'Generating PDF...',
            description: 'Please wait while we generate your high-resolution flyer.',
        });

        htmlToImage.toPng(qrRef.current, { cacheBust: true, pixelRatio: 3 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${business?.username || 'business'}-catalog-qr.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Failed to generate QR code', err);
                toast({
                    title: 'Error',
                    description: 'Failed to generate QR code flyer.',
                    variant: 'destructive',
                });
            });
    }, [business, toast]);

    const handleCopyLink = useCallback(async () => {
        const link = `https://www.linkbeet.in/${business?.username || ''}`;
        try {
            await navigator.clipboard.writeText(link);
            toast({
                title: 'Link Copied!',
                description: 'Profile link copied to clipboard.',
            });
        } catch (err) {
            console.error('Failed to copy link', err);
            toast({
                title: 'Error',
                description: 'Failed to copy link.',
                variant: 'destructive',
            });
        }
    }, [business?.username, toast]);

    if (!business) return null;

    const profileUrl = `https://www.linkbeet.in/${business.username}`;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Share & Promote</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="flex-1 border-0 shadow-sm md:border-2">
                    <CardHeader className="bg-muted/30 pb-4 border-b px-4 md:px-6">
                        <CardTitle className="text-xl">QR Code Flyer</CardTitle>
                        <CardDescription className="text-sm">
                            Download your custom QR code flyer to display at your business.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 pt-6 pb-6 px-4 md:px-6">
                        {/* Hidden printable area to render the full flyer image offscreen perfectly */}
                        <div className="w-full flex justify-center p-0 mb-2">
                            {/* Visual representation - accurately scaled down Version of the final flyer */}
                            <div className="bg-[#EEEEEE] overflow-hidden relative flex flex-col items-center w-full max-w-[340px] aspect-[1/1.414] shadow-xl border border-gray-200 shrink-0 select-none">
                                {/* Abstract Waves Background (approximate via SVG) */}
                                <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='1130' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-100 200 C 200 100, 600 300, 900 100' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 250 C 300 100, 500 500, 900 200' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 300 C 400 0, 400 600, 900 300' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 400 C 200 800, 600 -100, 900 400' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 500 C 300 700, 500 -200, 900 500' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 600 C 400 800, 400 -100, 900 600' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 700 C 200 400, 600 900, 900 700' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 100 C 200 -100, 600 400, 900 100' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 800 C 300 500, 500 1000, 900 800' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }}></div>

                                {/* Bottom solid gray block */}
                                <div className="absolute bottom-0 w-full h-[28%] bg-[#DFDFDF] z-0"></div>

                                {/* Header / Logo */}
                                <div className="w-full flex items-center justify-center mt-8 gap-3 z-10 px-4">
                                    {logoDataUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={logoDataUrl}
                                            alt="Logo"
                                            className="w-[52px] h-[52px] rounded-full object-cover bg-black shrink-0 relative z-20"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="w-[52px] h-[52px] rounded-full bg-black items-center justify-center shrink-0 relative z-20" style={{ display: (business.profileImage || business.logoUrl) && logoDataUrl ? 'none' : 'flex' }}>
                                        <span className="text-white font-bold text-xs tracking-wide">Logo</span>
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <h3 className="font-sans text-[22px] font-black text-black leading-none tracking-wider uppercase truncate relative z-20">
                                            {business.businessName}
                                        </h3>
                                        <p className="text-[15px] text-black font-bold mt-1.5 leading-none relative z-20">Product Catalog</p>
                                    </div>
                                </div>

                                {/* QR Code Container */}
                                <div className="bg-white p-3 mt-7 mb-auto z-10 w-[72%] aspect-square flex items-center justify-center shadow-sm relative">
                                    <QRCodeSVG
                                        value={profileUrl}
                                        width="100%"
                                        height="100%"
                                        level="H"
                                        includeMargin={false}
                                        fgColor="#000000"
                                        bgColor="#FFFFFF"
                                    />
                                </div>

                                {/* Footer Text */}
                                <div className="mt-auto text-center w-full pb-6 z-10 flex flex-col justify-end h-[28%] relative">
                                    <p className="text-black text-[13px] mb-2 leading-none">Scan the QR code to see our <span className="font-bold">full Catlog</span></p>
                                    <div className="w-[85%] h-[2px] bg-white mx-auto mb-2"></div>
                                    <p className="text-black text-[13px] leading-none text-center flex items-center gap-1.5 justify-center">
                                        Or visit <span className="font-bold">linkbeet.in/{business.username}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actual full-resolution node to convert to image. Rendered offscreen perfectly. */}
                        <div className="fixed -left-[9999px] top-0 pointer-events-none">
                            <div
                                ref={qrRef}
                                className="bg-[#EEEEEE] overflow-hidden relative flex flex-col items-center w-[800px] h-[1131px]"
                            >
                                {/* Abstract Waves Background (approximate via SVG) */}
                                <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='1130' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-100 200 C 200 100, 600 300, 900 100' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 250 C 300 100, 500 500, 900 200' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 300 C 400 0, 400 600, 900 300' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 400 C 200 800, 600 -100, 900 400' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 500 C 300 700, 500 -200, 900 500' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 600 C 400 800, 400 -100, 900 600' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 700 C 200 400, 600 900, 900 700' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 100 C 200 -100, 600 400, 900 100' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 800 C 300 500, 500 1000, 900 800' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }}></div>

                                {/* Bottom solid gray block */}
                                <div className="absolute bottom-0 w-full h-[28%] bg-[#DFDFDF] z-0"></div>

                                {/* Header / Logo */}
                                <div className="w-full flex items-center justify-center mt-20 gap-8 z-10 px-10">
                                    {logoDataUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={logoDataUrl}
                                            alt="Logo"
                                            className="w-[124px] h-[124px] rounded-full object-cover bg-black shrink-0 relative z-20"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="w-[124px] h-[124px] rounded-full bg-black items-center justify-center shrink-0 relative z-20" style={{ display: (business.profileImage || business.logoUrl) && logoDataUrl ? 'none' : 'flex' }}>
                                        <span className="text-white font-bold text-[28px] tracking-wide">Logo</span>
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <h3 className="font-sans text-[52px] font-black text-black leading-none tracking-wider uppercase relative z-20">
                                            {business.businessName}
                                        </h3>
                                        <p className="text-[36px] text-black font-bold mt-3 leading-none relative z-20">Product Catalog</p>
                                    </div>
                                </div>

                                {/* QR Code Container */}
                                <div className="bg-white p-7 mt-16 mb-auto z-10 w-[580px] h-[580px] flex items-center justify-center shadow-sm relative">
                                    <QRCodeSVG
                                        value={profileUrl}
                                        width="100%"
                                        height="100%"
                                        level="H"
                                        includeMargin={false}
                                        fgColor="#000000"
                                        bgColor="#FFFFFF"
                                    />
                                </div>

                                {/* Footer Text */}
                                <div className="mt-auto text-center w-full pb-14 z-10 flex flex-col justify-end h-[28%] relative">
                                    <p className="text-black text-[30px] mb-5 leading-none">Scan the QR code to see our <span className="font-bold">full Catlog</span></p>
                                    <div className="w-[85%] h-[4px] bg-white mx-auto mb-5"></div>
                                    <p className="text-black text-[30px] leading-none text-center flex items-center justify-center">
                                        Or visit <span className="font-bold ml-2 tracking-wide">linkbeet.in/{business.username}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-[340px] mt-2 gap-3 flex flex-col">
                            <Button onClick={handleDownload} className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow py-6 text-base font-medium" size="lg">
                                <Download className="w-5 h-5 mr-3" />
                                Download High-Res Flyer
                            </Button>
                            <Button onClick={handleCopyLink} variant="outline" className="w-full py-6 text-base font-medium border-2" size="lg">
                                <Link className="w-5 h-5 mr-3" />
                                Copy Profile Link
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full lg:w-[350px] shrink-0 h-fit border-0 shadow-sm md:border-2">
                    <CardHeader className="bg-muted/30 pb-4 border-b px-4 md:px-6">
                        <CardTitle className="text-xl">Usage Instructions</CardTitle>
                        <CardDescription className="text-sm">
                            How to use your QR code effectively
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground px-4 md:px-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs ring-4 ring-primary/5 shrink-0">1</span>
                                <h4 className="font-semibold text-foreground text-base">Print & Display</h4>
                            </div>
                            <p className="pl-8 text-gray-500 leading-relaxed text-sm">Print the downloaded flyer and place it on tables, at the checkout counter, or in your shop window for maximum visibility.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs ring-4 ring-primary/5 shrink-0">2</span>
                                <h4 className="font-semibold text-foreground text-base">Social Media</h4>
                            </div>
                            <p className="pl-8 text-gray-500 leading-relaxed text-sm">Share the QR code image on your social media channels (Instagram, Facebook) so followers can quickly access your catalog online.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs ring-4 ring-primary/5 shrink-0">3</span>
                                <h4 className="font-semibold text-foreground text-base">Quick Access</h4>
                            </div>
                            <p className="pl-8 text-gray-500 leading-relaxed text-sm">Customers can scan instantly without downloading any special apps—just pointing their standard smartphone camera is enough.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
