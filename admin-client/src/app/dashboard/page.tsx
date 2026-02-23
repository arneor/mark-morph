'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminBanner } from '@/lib/api';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
    Wifi,
    Megaphone,
    Mail,
    Building2,
    Search,
    CheckCircle2,
    ExternalLink,
    Clock,
    LogOut,
    Shield,
    Ban,
    Check,
    X,
    RefreshCw,
    Loader2,
    LucideIcon,
    Eye,
    Plus,
    Pencil,
    Trash2,
    ImageIcon,
    Upload,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

function StatsCard({
    title,
    value,
    icon: Icon,
    highlight,
}: {
    title: string;
    value: number;
    icon: LucideIcon;
    highlight?: boolean;
}) {
    return (
        <Card className={highlight ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm font-medium ${highlight ? 'text-yellow-700' : 'text-muted-foreground'}`}>
                            {title}
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-yellow-700' : ''}`}>
                            {value?.toLocaleString()}
                        </p>
                    </div>
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${highlight ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'
                            }`}
                    >
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Banners Tab Component ───────────────────────
function BannersTab() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkType, setLinkType] = useState<'internal' | 'external' | 'category'>('internal');
    const [accentColor, setAccentColor] = useState('#9EE53B');
    const [position, setPosition] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const resetForm = () => {
        setTitle('');
        setLinkUrl('');
        setLinkType('internal');
        setAccentColor('#9EE53B');
        setPosition(0);
        setIsActive(true);
        setImageFile(null);
        setImagePreview('');
        setEditingBanner(null);
    };

    const openCreate = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEdit = (b: AdminBanner) => {
        setEditingBanner(b);
        setTitle(b.title);
        setLinkUrl(b.linkUrl || '');
        setLinkType(b.linkType);
        setAccentColor(b.accentColor);
        setPosition(b.position);
        setIsActive(b.isActive);
        setImagePreview(b.imageUrl);
        setImageFile(null);
        setDialogOpen(true);
    };

    // Fetch banners
    const { data: banners, isLoading } = useQuery({
        queryKey: ['admin-banners'],
        queryFn: async () => {
            try { return await adminApi.getBanners(); } catch { return []; }
        },
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (fd: FormData) => adminApi.createBanner(fd),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            setDialogOpen(false);
            resetForm();
            toast({ title: 'Banner Created', description: 'The banner is now live.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, fd }: { id: string; fd: FormData }) => adminApi.updateBanner(id, fd),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            setDialogOpen(false);
            resetForm();
            toast({ title: 'Banner Updated' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            setDeleteConfirm(null);
            toast({ title: 'Banner Deleted' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        },
    });

    const handleSubmit = () => {
        if (!title.trim()) {
            toast({ title: 'Title is required', variant: 'destructive' });
            return;
        }
        if (!editingBanner && !imageFile) {
            toast({ title: 'Image is required', variant: 'destructive' });
            return;
        }

        const fd = new FormData();
        fd.append('title', title);
        fd.append('linkUrl', linkUrl);
        fd.append('linkType', linkType);
        fd.append('accentColor', accentColor);
        fd.append('position', String(position));
        fd.append('isActive', String(isActive));
        if (imageFile) fd.append('image', imageFile);

        if (editingBanner) {
            updateMutation.mutate({ id: editingBanner._id, fd });
        } else {
            createMutation.mutate(fd);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-green-500" />
                            Near-Me Promotional Banners
                        </CardTitle>
                        <CardDescription>
                            Manage banners displayed in the Near Me page carousel.
                        </CardDescription>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Banner
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : banners && banners.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Preview</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.map((b) => (
                                    <TableRow key={b._id}>
                                        <TableCell>
                                            <div className="w-24 h-10 rounded-md overflow-hidden bg-gray-100 relative">
                                                <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="96px" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{b.title}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                            {b.linkUrl || '—'}
                                        </TableCell>
                                        <TableCell>{b.position}</TableCell>
                                        <TableCell>
                                            {b.isActive ? (
                                                <Badge className="bg-green-500">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => setDeleteConfirm(b._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-30" />
                            <p>No banners yet. Add your first banner to start promoting!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
                <DialogContent className="bg-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
                        <DialogDescription>
                            {editingBanner ? 'Update this promotional banner.' : 'Add a new banner to the Near Me carousel.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* Image Upload */}
                        <div>
                            <Label>Banner Image</Label>
                            <div
                                className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <div className="relative aspect-21/9 w-full rounded-lg overflow-hidden">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="400px" />
                                    </div>
                                ) : (
                                    <div className="py-6">
                                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">Click to upload banner image</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="banner-title">Title</Label>
                            <Input id="banner-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Sale — up to 50% off" />
                        </div>

                        {/* Link URL */}
                        <div>
                            <Label htmlFor="banner-link">Link URL (optional)</Label>
                            <Input id="banner-link" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." />
                        </div>

                        {/* Link Type + Accent Color row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="banner-linkType">Link Type</Label>
                                <select
                                    id="banner-linkType"
                                    value={linkType}
                                    onChange={e => setLinkType(e.target.value as 'internal' | 'external' | 'category')}
                                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="internal">Internal</option>
                                    <option value="external">External</option>
                                    <option value="category">Category</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="banner-color">Accent Color</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="color" id="banner-color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                                    <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1" />
                                </div>
                            </div>
                        </div>

                        {/* Position + Active row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="banner-position">Position</Label>
                                <Input id="banner-position" type="number" min={0} value={position} onChange={e => setPosition(Number(e.target.value))} />
                            </div>
                            <div className="flex items-center justify-between pt-6">
                                <Label htmlFor="banner-active">Active</Label>
                                <Switch id="banner-active" checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingBanner ? 'Save Changes' : 'Create Banner'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
                <DialogContent className="bg-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Banner</DialogTitle>
                        <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Authentication state to prevent hydration mismatch
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!adminApi.isAuthenticated()) {
            router.push('/login');
        } else {
            // Delay state update to avoid synchronous state update warning
            setTimeout(() => setIsAuthorized(true), 0);
        }
    }, [router]);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');

    // Rejection/suspension dialog state
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: 'reject' | 'suspend' | null;
        businessId: string;
        businessName: string;
    }>({ open: false, type: null, businessId: '', businessName: '' });
    const [actionReason, setActionReason] = useState('');

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            try {
                return await adminApi.getStats();
            } catch {
                return {
                    totalBusinesses: 0,
                    totalConnections: 0,
                    totalActiveCampaigns: 0,
                    totalEmailsCollected: 0,
                    pendingApprovalCount: 0,
                };
            }
        },
        enabled: isAuthorized,
    });

    // Fetch all businesses
    const { data: businesses } = useQuery({
        queryKey: ['admin-businesses'],
        queryFn: async () => {
            try {
                return await adminApi.getBusinesses();
            } catch {
                return [];
            }
        },
        enabled: isAuthorized,
    });

    // Fetch pending businesses
    const { data: pendingBusinesses } = useQuery({
        queryKey: ['admin-pending-businesses'],
        queryFn: async () => {
            try {
                return await adminApi.getPendingBusinesses();
            } catch {
                return [];
            }
        },
        enabled: isAuthorized,
    });

    // Activate business mutation
    const activateMutation = useMutation({
        mutationFn: (businessId: string) => adminApi.activateBusiness(businessId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-pending-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            toast({
                title: 'Business Activated',
                description: `${data.businessName} has been approved and activated.`,
            });
        },
        onError: (err: Error) => {
            toast({
                title: 'Activation Failed',
                description: err.message || 'Could not activate business',
                variant: 'destructive',
            });
        },
    });

    // Reject business mutation
    const rejectMutation = useMutation({
        mutationFn: ({ businessId, reason }: { businessId: string; reason?: string }) =>
            adminApi.rejectBusiness(businessId, reason),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-pending-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setActionDialog({ open: false, type: null, businessId: '', businessName: '' });
            setActionReason('');
            toast({
                title: 'Business Rejected',
                description: `${data.businessName} has been rejected.`,
            });
        },
        onError: (err: Error) => {
            toast({
                title: 'Rejection Failed',
                description: err.message || 'Could not reject business',
                variant: 'destructive',
            });
        },
    });

    // Suspend business mutation
    const suspendMutation = useMutation({
        mutationFn: ({ businessId, reason }: { businessId: string; reason?: string }) =>
            adminApi.suspendBusiness(businessId, reason),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-pending-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setActionDialog({ open: false, type: null, businessId: '', businessName: '' });
            setActionReason('');
            toast({
                title: 'Business Suspended',
                description: `${data.businessName} has been suspended.`,
            });
        },
        onError: (err: Error) => {
            toast({
                title: 'Suspension Failed',
                description: err.message || 'Could not suspend business',
                variant: 'destructive',
            });
        },
    });

    // Suspend Beet Link mutation
    const suspendBeetLinkMutation = useMutation({
        mutationFn: ({ businessId, reason }: { businessId: string; reason?: string }) =>
            adminApi.suspendBeetLink(businessId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            toast({ title: 'Beet Link Suspended', description: 'Beet Link profile has been suspended.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
        },
    });

    // Unsuspend Beet Link mutation
    const unsuspendBeetLinkMutation = useMutation({
        mutationFn: (businessId: string) =>
            adminApi.unsuspendBeetLink(businessId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            toast({ title: 'Beet Link Restored', description: 'Beet Link profile has been restored.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
        },
    });

    // Suspend Splash mutation
    const suspendSplashMutation = useMutation({
        mutationFn: ({ businessId, reason }: { businessId: string; reason?: string }) =>
            adminApi.suspendSplash(businessId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            toast({ title: 'Splash Suspended', description: 'WiFi Splash page has been suspended.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
        },
    });

    // Unsuspend Splash mutation
    const unsuspendSplashMutation = useMutation({
        mutationFn: (businessId: string) =>
            adminApi.unsuspendSplash(businessId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            toast({ title: 'Splash Restored', description: 'WiFi Splash page has been restored.' });
        },
        onError: (err: Error) => {
            toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
        },
    });

    // Handle logout
    const handleLogout = () => {
        adminApi.logout();
        router.push('/login');
    };

    // Filter businesses by search
    const filteredBusinesses = businesses?.filter(
        (biz) =>
            biz.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            biz.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            biz.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500">Active</Badge>;
            case 'pending_approval':
                return (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                        Pending
                    </Badge>
                );
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'suspended':
                return (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        Suspended
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Handle action dialog submit
    const handleActionSubmit = () => {
        if (actionDialog.type === 'reject') {
            rejectMutation.mutate({ businessId: actionDialog.businessId, reason: actionReason });
        } else if (actionDialog.type === 'suspend') {
            suspendMutation.mutate({ businessId: actionDialog.businessId, reason: actionReason });
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-8 h-8 text-purple-600" />
                            Platform Admin
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage all businesses and platform operations.
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* Tabs for Top-Level Navigation */}
                <Tabs defaultValue="operations" className="w-full space-y-6">
                    <div className="flex justify-start">
                        <TabsList className="grid w-[600px] grid-cols-3">
                            <TabsTrigger value="operations">Business Operations</TabsTrigger>
                            <TabsTrigger value="banners">Near-Me Banners</TabsTrigger>
                            <TabsTrigger value="overview">Analytics Overview</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* OPERATIONS TAB (Existing Dashboard) */}
                    <TabsContent value="operations" className="space-y-8">
                        {/* Global Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <StatsCard title="Active Businesses" value={stats?.totalBusinesses || 0} icon={Building2} />
                            <StatsCard
                                title="Pending Approval"
                                value={stats?.pendingApprovalCount || 0}
                                icon={Clock}
                                highlight={Boolean(stats?.pendingApprovalCount && stats.pendingApprovalCount > 0)}
                            />
                            <StatsCard title="Total Connections" value={stats?.totalConnections || 0} icon={Wifi} />
                            <StatsCard title="Active Campaigns" value={stats?.totalActiveCampaigns || 0} icon={Megaphone} />
                            <StatsCard title="Emails Collected" value={stats?.totalEmailsCollected || 0} icon={Mail} />
                        </div>

                        <Tabs defaultValue="pending" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="pending" className="relative">
                                    Pending Approval
                                    {pendingBusinesses && pendingBusinesses.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {pendingBusinesses.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="all">All Businesses</TabsTrigger>
                            </TabsList>

                            {/* Pending Approval Tab */}
                            <TabsContent value="pending" className="space-y-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-yellow-500" />
                                                Businesses Awaiting Approval
                                            </CardTitle>
                                            <CardDescription>
                                                Review and approve new business registrations.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                queryClient.invalidateQueries({ queryKey: ['admin-pending-businesses'] });
                                                queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
                                                toast({
                                                    title: 'Refreshed',
                                                    description: 'Pending approvals list has been refreshed.',
                                                });
                                            }}
                                            className="gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Refresh
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {pendingBusinesses && pendingBusinesses.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Business</TableHead>
                                                        <TableHead>Owner</TableHead>
                                                        <TableHead>Location</TableHead>
                                                        <TableHead>Registered</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pendingBusinesses.map((biz) => (
                                                        <TableRow key={biz.id}>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-md bg-yellow-100 flex items-center justify-center text-yellow-700 text-xs font-bold">
                                                                        {biz.businessName?.substring(0, 2).toUpperCase() || '??'}
                                                                    </div>
                                                                    <div>
                                                                        <div>{biz.businessName}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {biz.category}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm">{biz.ownerEmail || '—'}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {biz.ownerPhone || '—'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{biz.location || '—'}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {new Date(biz.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-green-500 hover:bg-green-600"
                                                                        onClick={() => activateMutation.mutate(biz.id)}
                                                                        disabled={activateMutation.isPending}
                                                                    >
                                                                        <Check className="w-4 h-4 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            setActionDialog({
                                                                                open: true,
                                                                                type: 'reject',
                                                                                businessId: biz.id,
                                                                                businessName: biz.businessName,
                                                                            })
                                                                        }
                                                                    >
                                                                        <X className="w-4 h-4 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="py-12 text-center text-muted-foreground">
                                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                                <p>No pending approvals. All caught up!</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* All Businesses Tab */}
                            <TabsContent value="all" className="space-y-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                        <div>
                                            <CardTitle>All Businesses</CardTitle>
                                            <CardDescription>View and manage all registered businesses.</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search businesses..."
                                                    className="pl-8 w-[200px] lg:w-[300px]"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Business</TableHead>
                                                    <TableHead>Owner</TableHead>
                                                    <TableHead>Metrics</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredBusinesses?.map((biz) => (
                                                    <TableRow key={biz.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                                    {biz.businessName?.substring(0, 2).toUpperCase() || '??'}
                                                                </div>
                                                                <div>
                                                                    <div>{biz.businessName}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {biz.location || 'No Location'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">{biz.ownerEmail || '—'}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {biz.ownerPhone || '—'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs">
                                                                <div>Ads: {biz.adsCount}</div>
                                                                <div>Connections: {biz.connectionCount}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(biz.status)}
                                                            {biz.rejectionReason && (
                                                                <div className="text-xs text-red-500 mt-1">
                                                                    Reason: {biz.rejectionReason}
                                                                </div>
                                                            )}
                                                            {biz.suspensionReason && (
                                                                <div className="text-xs text-orange-500 mt-1">
                                                                    Reason: {biz.suspensionReason}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => router.push(`/business/${biz.id}`)}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        window.open(
                                                                            `${process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || 'https://www.linkbeet.in'}/${biz.username}`,
                                                                            '_blank',
                                                                            'noopener,noreferrer'
                                                                        )
                                                                    }
                                                                >
                                                                    Beet Link
                                                                    <ExternalLink className="w-4 h-4 ml-2" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        window.open(
                                                                            `${process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || 'https://www.linkbeet.in'}/splash/${biz.id}`,
                                                                            '_blank',
                                                                            'noopener,noreferrer'
                                                                        )
                                                                    }
                                                                >
                                                                    Splash
                                                                    <ExternalLink className="w-4 h-4 ml-2" />
                                                                </Button>

                                                                {biz.status !== 'active' && biz.status !== 'pending_approval' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-green-600 border-green-600"
                                                                        onClick={() => activateMutation.mutate(biz.id)}
                                                                        disabled={activateMutation.isPending}
                                                                    >
                                                                        Reactivate
                                                                    </Button>
                                                                )}

                                                                {biz.status === 'active' && (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-orange-600 border-orange-600"
                                                                            >
                                                                                <Ban className="w-4 h-4 mr-1" />
                                                                                Suspend
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="bg-white">
                                                                            {biz.isBeetLinkSuspended ? (
                                                                                <DropdownMenuItem
                                                                                    onClick={() => unsuspendBeetLinkMutation.mutate(biz.id)}
                                                                                    className="text-green-600"
                                                                                >
                                                                                    <Check className="w-4 h-4 mr-2" />
                                                                                    Restore Beet Link
                                                                                </DropdownMenuItem>
                                                                            ) : (
                                                                                <DropdownMenuItem
                                                                                    onClick={() => suspendBeetLinkMutation.mutate({ businessId: biz.id, reason: 'Admin action' })}
                                                                                    className="text-orange-600"
                                                                                >
                                                                                    <Ban className="w-4 h-4 mr-2" />
                                                                                    Suspend Beet Link
                                                                                </DropdownMenuItem>
                                                                            )}

                                                                            {biz.isSplashSuspended ? (
                                                                                <DropdownMenuItem
                                                                                    onClick={() => unsuspendSplashMutation.mutate(biz.id)}
                                                                                    className="text-green-600"
                                                                                >
                                                                                    <Check className="w-4 h-4 mr-2" />
                                                                                    Restore Splash Page
                                                                                </DropdownMenuItem>
                                                                            ) : (
                                                                                <DropdownMenuItem
                                                                                    onClick={() => suspendSplashMutation.mutate({ businessId: biz.id, reason: 'Admin action' })}
                                                                                    className="text-orange-600"
                                                                                >
                                                                                    <Ban className="w-4 h-4 mr-2" />
                                                                                    Suspend Splash Page
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    setActionDialog({
                                                                                        open: true,
                                                                                        type: 'suspend',
                                                                                        businessId: biz.id,
                                                                                        businessName: biz.businessName,
                                                                                    })
                                                                                }
                                                                                className="text-red-600"
                                                                            >
                                                                                <Ban className="w-4 h-4 mr-2" />
                                                                                Suspend Entire Business
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {filteredBusinesses?.length === 0 && (
                                            <div className="py-12 text-center text-muted-foreground">
                                                No businesses found matching your search.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* ANALYTICS OVERVIEW TAB */}
                    <TabsContent value="overview">
                        <AdminAnalytics />
                    </TabsContent>

                    {/* BANNERS TAB */}
                    <TabsContent value="banners">
                        <BannersTab />
                    </TabsContent>
                </Tabs>

                {/* Action Dialog */}
                <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog(prev => ({ ...prev, open: false }))}>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                            <DialogTitle>
                                {actionDialog.type === 'reject' ? 'Reject Business' : 'Suspend Business'}
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to {actionDialog.type} &quot;{actionDialog.businessName}&quot;?
                                This action will restrict access for the business owner.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <h4 className="text-sm font-medium mb-2 block">
                                Reason for {actionDialog.type === 'reject' ? 'rejection' : 'suspension'}
                            </h4>
                            <Input
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Enter reason..."
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setActionDialog(prev => ({ ...prev, open: false }))}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleActionSubmit}
                                disabled={!actionReason}
                            >
                                Confirm {actionDialog.type === 'reject' ? 'Rejection' : 'Suspension'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
