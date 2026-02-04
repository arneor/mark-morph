import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
            <div className="p-4 bg-slate-100 rounded-full">
                <FileQuestion className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">404</h1>
            <p className="text-slate-500">Page not found</p>
            <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    );
}
