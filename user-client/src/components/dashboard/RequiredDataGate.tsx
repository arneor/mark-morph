'use client';

import { RequiredDataModal, defaultRequiredFields } from './RequiredDataModal';
import { useBusiness } from '@/hooks/use-businesses';
import { useQueryClient } from '@tanstack/react-query';
import { MessageCircle, PhoneCall } from 'lucide-react';

interface RequiredDataGateProps {
    businessId: string;
    children: React.ReactNode;
}

export function RequiredDataGate({ businessId, children }: RequiredDataGateProps) {
    const { data: business, isLoading } = useBusiness(businessId);
    const queryClient = useQueryClient();

    // Don't block while loading
    if (isLoading || !business) {
        return <>{children}</>;
    }

    const handleComplete = () => {
        // Invalidate business query to refresh data
        queryClient.invalidateQueries({ queryKey: ['business', businessId] });
    };

    const getWhatsAppUrl = () => {
        const baseMsg = `Hi Support, I need some help with my ${business?.status === 'suspended' ? 'suspended' : 'rejected'} Linkbeet dashboard.`;
        if (!business) return `https://wa.me/919744880311?text=${encodeURIComponent(baseMsg)}`;

        const businessInfo = `\n\n--- Business Details ---\nName: ${business.businessName}\nID: ${business.id}\nEmail: ${business.contactEmail || 'N/A'}\nLocation: ${business.location || 'N/A'}\nUsername: ${business.username || 'N/A'}`;

        return `https://wa.me/919744880311?text=${encodeURIComponent(baseMsg + businessInfo)}`;
    };

    if (business.status === "suspended" || business.status === "rejected") {
        return (
            <>
                <div className="pointer-events-none opacity-50 select-none blur-sm transition-all duration-300">
                    {children}
                </div>
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-t-4 border-red-500 animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Account {business.status === 'suspended' ? 'Suspended' : 'Rejected'}</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Your business account has been {business.status === 'suspended' ? 'suspended' : 'rejected'} by the platform administrator.
                            {(business.suspensionReason || business.rejectionReason) && (
                                <span className="block mt-3 p-3 bg-red-50 text-red-800 rounded-lg text-sm text-center">
                                    Reason: {business.suspensionReason || business.rejectionReason}
                                </span>
                            )}
                        </p>
                        <p className="text-sm text-gray-500 mb-8 px-2">
                            You currently do not have access to your dashboard. Please contact Linkbeet Support to resolve this issue and restore access.
                        </p>
                        <div className="flex flex-row gap-3">
                            <a
                                href={getWhatsAppUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all text-[#128C7E] font-medium"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>WhatsApp</span>
                            </a>
                            <a
                                href="tel:9744880311"
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary font-medium"
                            >
                                <PhoneCall className="w-5 h-5" />
                                <span>Call Support</span>
                            </a>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <RequiredDataModal
            businessId={businessId}
            businessData={business as unknown as Record<string, unknown>}
            requiredFields={defaultRequiredFields}
            onComplete={handleComplete}
        >
            {children}
        </RequiredDataModal>
    );
}
