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
    const [qrType, setQrType] = useState<'profile' | 'catalog'>('profile');

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
                link.download = `${business?.username || 'business'}-${qrType === 'catalog' ? 'catalog' : 'profile'}-qr.png`;
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
    }, [business, toast, qrType]);

    const handleCopyLink = useCallback(async () => {
        const link = qrType === 'catalog'
            ? `https://www.linkbeet.in/${business?.username || ''}/catalog`
            : `https://www.linkbeet.in/${business?.username || ''}`;
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
    }, [business?.username, toast, qrType]);

    if (!business) return null;

    const profileUrl = `https://www.linkbeet.in/${business.username}`;
    const catalogUrl = `https://www.linkbeet.in/${business.username}/catalog`;
    const activeUrl = qrType === 'catalog' ? catalogUrl : profileUrl;
    const activeShortUrl = qrType === 'catalog' ? `linkbeet.in/${business.username}/catalog` : `linkbeet.in/${business.username}`;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Share & Promote</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="flex-1 border-0 shadow-sm md:border-2">
                    <CardHeader className="bg-muted/30 pb-4 border-b px-4 md:px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-xl">QR Code Flyer</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                    Download your custom QR code flyer to display at your business.
                                </CardDescription>
                            </div>
                            <div className="flex bg-muted rounded-lg p-1 gap-1 shrink-0 self-start md:self-auto">
                                <button
                                    onClick={() => setQrType('profile')}
                                    className={`px-4 py-2 text-sm md:text-xs md:px-3 md:py-1.5 font-semibold rounded-md transition-all ${qrType === 'profile'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => setQrType('catalog')}
                                    className={`px-4 py-2 text-sm md:text-xs md:px-3 md:py-1.5 font-semibold rounded-md transition-all ${qrType === 'catalog'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Catalog
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 pt-6 pb-6 px-4 md:px-6">
                        {/* Hidden printable area to render the full flyer image offscreen perfectly */}
                        <div className="w-full flex justify-center p-0 mb-2">
                            {/* Visual representation - accurately scaled down Version of the final flyer */}
                            <div className="bg-[#FBC02D] overflow-hidden relative flex flex-col items-center w-full max-w-[340px] aspect-[1/1.414] shadow-xl border border-[#E8B800]/40 shrink-0 select-none">
                                {/* Abstract Waves Background - thin golden curves */}
                                <div className="absolute inset-0 opacity-[0.50] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='1130' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-100 80 C 200 -20, 500 180, 900 60' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 140 C 300 40, 600 280, 900 120' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 200 C 200 100, 600 300, 900 180' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 280 C 400 80, 400 480, 900 260' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 360 C 200 560, 600 60, 900 340' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 440 C 300 640, 500 40, 900 420' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 520 C 400 720, 400 120, 900 500' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M-100 600 C 200 400, 600 800, 900 580' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M700 -50 C 750 200, 850 400, 900 700' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3Cpath d='M600 -50 C 680 150, 780 350, 820 650' stroke='%23DAA520' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }}></div>

                                {/* Bottom solid amber block */}
                                <div className="absolute bottom-0 w-full h-[20%] bg-[#F0AD00] z-0"></div>

                                {/* Header: Logo + Business Name - LEFT aligned */}
                                <div className="w-full flex items-center mt-[7%] gap-2.5 z-10 px-[8%]">
                                    {logoDataUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={logoDataUrl}
                                            alt="Logo"
                                            className="w-[62px] h-[62px] rounded-full object-cover bg-black shrink-0 relative z-20 border-2 border-black/10"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="w-[62px] h-[62px] rounded-full bg-black items-center justify-center shrink-0 relative z-20 border-2 border-black/10" style={{ display: (business.profileImage || business.logoUrl) && logoDataUrl ? 'none' : 'flex' }}>
                                        <span className="text-white font-bold text-[10px] tracking-wide">Logo</span>
                                    </div>
                                    <h3 className="font-sans text-[24px] font-black text-[#1a1a1a] leading-none tracking-[0.06em] uppercase relative z-20" style={{ fontStretch: 'condensed' }}>
                                        {business.businessName}
                                    </h3>
                                </div>

                                {/* Service Catalog subtitle - centered */}
                                <p className="text-[16px] text-[#1a1a1a] font-bold mt-[3%] leading-none relative z-20 tracking-wide">{qrType === 'catalog' ? 'Service Catalog' : 'Profile'}</p>

                                {/* QR Code Container - generous white padding */}
                                <div className="bg-white p-[5%] mt-[5%] z-10 w-[78%] aspect-square flex items-center justify-center relative rounded-[2px]">
                                    <QRCodeSVG
                                        value={activeUrl}
                                        width="100%"
                                        height="100%"
                                        level="H"
                                        includeMargin={false}
                                        fgColor="#000000"
                                        bgColor="#FFFFFF"
                                    />
                                </div>

                                {/* Footer Text - in amber bottom area */}
                                <div className="mt-auto text-center w-full pb-[5%] z-10 flex flex-col items-center justify-end h-[20%] relative px-[6%]">
                                    <p className="text-[#1a1a1a] text-[14px] mb-[6px] leading-none font-medium">Scan the QR code to see our <span className="font-extrabold">{qrType === 'catalog' ? 'full Catlog' : 'Profile'}</span></p>
                                    <div className="w-[90%] h-[2px] bg-[#D4A017] mx-auto mb-[6px]"></div>
                                    <p className="text-[#1a1a1a] text-[14px] leading-none text-center font-medium">
                                        Or visit <span className="font-extrabold tracking-wide">{activeShortUrl}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actual full-resolution node to convert to image. Rendered offscreen. */}
                        <div className="fixed -left-[9999px] top-0 pointer-events-none">
                            <div
                                ref={qrRef}
                                className="bg-[#FBC02D] overflow-hidden relative flex flex-col items-center w-[800px] h-[1131px]"
                            >
                                {/* Abstract Waves Background - thin golden curves */}
                                <div className="absolute inset-0 opacity-[0.50] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='1130' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-100 80 C 200 -20, 500 180, 900 60' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M-100 140 C 300 40, 600 280, 900 120' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M-100 200 C 200 100, 600 300, 900 180' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M-100 280 C 400 80, 400 480, 900 260' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M-100 360 C 200 560, 600 60, 900 340' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M-100 440 C 300 640, 500 40, 900 420' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M-100 520 C 400 720, 400 120, 900 500' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M-100 600 C 200 400, 600 800, 900 580' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M700 -50 C 750 200, 850 400, 900 700' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3Cpath d='M600 -50 C 680 150, 780 350, 820 650' stroke='%23DAA520' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }}></div>

                                {/* Bottom solid amber block */}
                                <div className="absolute bottom-0 w-full h-[20%] bg-[#F0AD00] z-0"></div>

                                {/* Header: Logo + Business Name - LEFT aligned */}
                                <div className="w-full flex items-center mt-[80px] gap-[20px] z-10 px-[60px]">
                                    {logoDataUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={logoDataUrl}
                                            alt="Logo"
                                            className="w-[140px] h-[140px] rounded-full object-cover bg-black shrink-0 relative z-20 border-[3px] border-black/10"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="w-[140px] h-[140px] rounded-full bg-black items-center justify-center shrink-0 relative z-20 border-[3px] border-black/10" style={{ display: (business.profileImage || business.logoUrl) && logoDataUrl ? 'none' : 'flex' }}>
                                        <span className="text-white font-bold text-[28px] tracking-wide">Logo</span>
                                    </div>
                                    <h3 className="font-sans text-[56px] font-black text-[#1a1a1a] leading-none tracking-[0.06em] uppercase relative z-20" style={{ fontStretch: 'condensed' }}>
                                        {business.businessName}
                                    </h3>
                                </div>

                                {/* Service Catalog subtitle - centered */}
                                <p className="text-[38px] text-[#1a1a1a] font-bold mt-[30px] leading-none relative z-20 tracking-wide">{qrType === 'catalog' ? 'Service Catalog' : 'Profile'}</p>

                                {/* QR Code Container - generous white padding matching reference */}
                                <div className="bg-white p-[40px] mt-[45px] z-10 w-[620px] h-[620px] flex items-center justify-center relative rounded-[3px]">
                                    <QRCodeSVG
                                        value={activeUrl}
                                        width="100%"
                                        height="100%"
                                        level="H"
                                        includeMargin={false}
                                        fgColor="#000000"
                                        bgColor="#FFFFFF"
                                    />
                                </div>

                                {/* Footer Text - in amber bottom area */}
                                <div className="mt-auto text-center w-full pb-[50px] z-10 flex flex-col items-center justify-end h-[20%] relative px-[50px]">
                                    <p className="text-[#1a1a1a] text-[32px] mb-[18px] leading-none font-medium">Scan the QR code to see our <span className="font-extrabold">{qrType === 'catalog' ? 'full Catlog' : 'Profile'}</span></p>
                                    <div className="w-[90%] h-[4px] bg-[#D4A017] mx-auto mb-[18px]"></div>
                                    <p className="text-[#1a1a1a] text-[32px] leading-none text-center font-medium">
                                        Or visit <span className="font-extrabold ml-2 tracking-wide">{activeShortUrl}</span>
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
                                Copy {qrType === 'catalog' ? 'Catalog' : 'Profile'} Link
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
