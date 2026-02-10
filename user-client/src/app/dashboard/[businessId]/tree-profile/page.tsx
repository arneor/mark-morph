
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { dummyTreeProfileData } from '@/lib/dummyTreeProfileData';
import { TreeProfileSkeleton } from '@/components/tree-profile/TreeProfileSkeleton';
import dynamic from 'next/dynamic';

// Dynamically import the heavy client editor to split the bundle
const TreeProfileEditor = dynamic(
    () => import('@/components/tree-profile/TreeProfileEditor'),
    {
        ssr: true, // Render initial HTML on server for LCP
        loading: () => <TreeProfileSkeleton />
    }
);

// Force dynamic rendering if this page deals with dynamic business IDs or auth
export const dynamicParams = true;

// Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ businessId: string }> }): Promise<Metadata> {
    // Await params because in Next.js 15+ params are async
    await params;

    // In a real app, fetch the business name here
    const title = `${dummyTreeProfileData.businessName} | Profile`;
    return {
        title: title,
        description: dummyTreeProfileData.description,
        openGraph: {
            title: title,
            description: dummyTreeProfileData.description || '',
            images: [dummyTreeProfileData.profileImage],
        }
    };
}

// Simulated Server-Side Data Fetching with caching
async function getProfileData() {
    // Simulate network delay to demonstrate Suspense
    // In production: const res = await fetch(`.../api/business/${businessId}`, { next: { revalidate: 3600 } });

    // Return dummy data for now, but treating it as async
    return new Promise<typeof dummyTreeProfileData>((resolve) => {
        // resolve immediately in production for speed, but simulating async nature here ensures we use Suspense correctly
        // setTimeout(resolve, 0, dummyTreeProfileData);
        resolve(dummyTreeProfileData);
    });
}

export default async function TreeProfilePage({ params }: { params: Promise<{ businessId: string }> }) {
    // Await the params object (Next.js 15+ requirement)
    await params;

    return (
        <Suspense fallback={<TreeProfileSkeleton />}>
            <ProfileFetcher />
        </Suspense>
    );
}

// Intermediate component to handle async data fetching
async function ProfileFetcher() {
    const profileData = await getProfileData();
    return <TreeProfileEditor initialData={profileData} />;
}
