'use client';

import { RequiredDataModal, defaultRequiredFields } from './RequiredDataModal';
import { useBusiness } from '@/hooks/use-businesses';
import { useQueryClient } from '@tanstack/react-query';

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
