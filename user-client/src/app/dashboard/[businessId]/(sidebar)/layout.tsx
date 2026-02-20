import { Sidebar } from '@/components/dashboard/Sidebar';
import { RequiredDataGate } from '@/components/dashboard/RequiredDataGate';

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        businessId: string;
    }>;
}

export default async function DashboardLayout({
    children,
    params,
}: DashboardLayoutProps) {
    const { businessId } = await params;

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar businessId={businessId} />
            <main className="flex-1 w-full overflow-y-auto max-h-screen pt-16 md:pt-0">
                <RequiredDataGate businessId={businessId}>
                    {children}
                </RequiredDataGate>
            </main>
        </div>
    );
}
