'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi, type Offer } from '@/lib/api';
import {
    Plus,
    Pencil,
    Trash2,
    MapPin,
    Calendar,
    Tag,
    Upload,
    X,
    Crosshair,
    IndianRupee,
    Percent,
    CheckCircle,
    Clock,
    FileEdit,
    ImageIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// ─── Constants ──────────────────────────────────
const OFFER_CATEGORIES = [
    { value: 'mobile', label: 'Mobile Phones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tv', label: 'TV & Displays' },
    { value: 'fridge', label: 'Fridge & Appliances' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'furniture', label: 'Furniture & Decor' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'books', label: 'Books & Stationery' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' },
];

const STATUS_CONFIG = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600', icon: FileEdit },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-600', icon: Clock },
};

// ─── Types ──────────────────────────────────────
interface OfferFormData {
    title: string;
    description: string;
    category: string;
    originalPrice: string;
    offerPrice: string;
    currency: string;
    validFrom: string;
    validUntil: string;
    latitude: string;
    longitude: string;
    address: string;
    status: string;
    tags: string;
    termsAndConditions: string;
    contactPhone: string;
    contactEmail: string;
}

const emptyForm: OfferFormData = {
    title: '',
    description: '',
    category: '',
    originalPrice: '',
    offerPrice: '',
    currency: 'INR',
    validFrom: '',
    validUntil: '',
    latitude: '',
    longitude: '',
    address: '',
    status: 'draft',
    tags: '',
    termsAndConditions: '',
    contactPhone: '',
    contactEmail: '',
};

// ─── Main Component ──────────────────────────────
export default function OffersPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [showForm, setShowForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [form, setForm] = useState<OfferFormData>(emptyForm);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // ─── Queries ─────────────────────────────────
    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['offers', 'my'],
        queryFn: () => offersApi.getMyOffers(),
    });

    // ─── Mutations ───────────────────────────────
    const createMutation = useMutation({
        mutationFn: (data: Parameters<typeof offersApi.create>[0]) => offersApi.create(data),
        onSuccess: async (newOffer) => {
            // Upload banner if file selected
            if (bannerFile && newOffer._id) {
                try {
                    await offersApi.uploadBanner(newOffer._id, bannerFile);
                } catch {
                    toast({ title: 'Offer created but banner upload failed', variant: 'destructive' });
                }
            }
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            resetForm();
            toast({ title: 'Offer created successfully!' });
        },
        onError: () => { toast({ title: 'Failed to create offer', variant: 'destructive' }); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Offer> }) => offersApi.update(id, data),
        onSuccess: async (updatedOffer) => {
            if (bannerFile && (updatedOffer._id || updatedOffer.id)) {
                try {
                    await offersApi.uploadBanner(updatedOffer._id || updatedOffer.id, bannerFile);
                } catch {
                    toast({ title: 'Offer updated but banner upload failed', variant: 'destructive' });
                }
            }
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            resetForm();
            toast({ title: 'Offer updated successfully!' });
        },
        onError: () => { toast({ title: 'Failed to update offer', variant: 'destructive' }); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => offersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            setDeleteConfirm(null);
            toast({ title: 'Offer deleted successfully!' });
        },
        onError: () => { toast({ title: 'Failed to delete offer', variant: 'destructive' }); },
    });

    // ─── Helpers ─────────────────────────────────
    const resetForm = useCallback(() => {
        setForm(emptyForm);
        setShowForm(false);
        setEditingOffer(null);
        setBannerFile(null);
        setBannerPreview(null);
    }, []);

    const openEditForm = useCallback((offer: Offer) => {
        setEditingOffer(offer);
        setForm({
            title: offer.title,
            description: offer.description || '',
            category: offer.category,
            originalPrice: offer.originalPrice?.toString() || '',
            offerPrice: offer.offerPrice?.toString() || '',
            currency: offer.currency || 'INR',
            validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().slice(0, 16) : '',
            validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 16) : '',
            latitude: offer.location?.coordinates?.[1]?.toString() || '',
            longitude: offer.location?.coordinates?.[0]?.toString() || '',
            address: offer.address || '',
            status: offer.status,
            tags: offer.tags?.join(', ') || '',
            termsAndConditions: offer.termsAndConditions || '',
            contactPhone: offer.contactPhone || '',
            contactEmail: offer.contactEmail || '',
        });
        setBannerPreview(offer.bannerUrl || null);
        setShowForm(true);
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.category || !form.latitude || !form.longitude) {
            toast({ title: 'Please fill in required fields (Title, Category, Location)', variant: 'destructive' });
            return;
        }

        const payload = {
            title: form.title,
            description: form.description || undefined,
            category: form.category,
            originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
            offerPrice: form.offerPrice ? parseFloat(form.offerPrice) : undefined,
            currency: form.currency,
            validFrom: form.validFrom || undefined,
            validUntil: form.validUntil || undefined,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
            address: form.address || undefined,
            status: form.status || 'draft',
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
            termsAndConditions: form.termsAndConditions || undefined,
            contactPhone: form.contactPhone || undefined,
            contactEmail: form.contactEmail || undefined,
        };

        if (editingOffer) {
            const offerId = editingOffer._id || editingOffer.id;
            updateMutation.mutate({ id: offerId, data: payload as Partial<Offer> });
        } else {
            createMutation.mutate(payload);
        }
    }, [form, editingOffer, createMutation, updateMutation, toast]);

    const handleGetLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast({ title: 'Geolocation is not supported by your browser', variant: 'destructive' });
            return;
        }
        setIsLocating(true);

        const onSuccess = (position: GeolocationPosition) => {
            setForm(prev => ({
                ...prev,
                latitude: position.coords.latitude.toFixed(6),
                longitude: position.coords.longitude.toFixed(6),
            }));
            setIsLocating(false);
            toast({ title: 'Location captured successfully!' });
        };

        const onFallbackError = (error: GeolocationPositionError) => {
            setIsLocating(false);
            toast({
                title: 'Could not get location',
                description: error.code === error.PERMISSION_DENIED
                    ? 'Location permission denied. Please enable it in browser settings.'
                    : 'Unable to detect location. Please enter coordinates manually.',
                variant: 'destructive',
            });
        };

        // First attempt: high accuracy with generous timeout
        navigator.geolocation.getCurrentPosition(
            onSuccess,
            () => {
                // Fallback: low accuracy with cached position allowed
                navigator.geolocation.getCurrentPosition(
                    onSuccess,
                    onFallbackError,
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
                );
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 300000 }
        );
    }, [toast]);

    const handleBannerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    }, []);

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            if (bannerPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [bannerPreview]);

    const discountDisplay = useCallback((offer: Offer) => {
        if (offer.discountPercentage) return `${offer.discountPercentage}% OFF`;
        if (offer.originalPrice && offer.offerPrice && offer.originalPrice > 0) {
            return `${Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100)}% OFF`;
        }
        return null;
    }, []);

    const isSaving = createMutation.isPending || updateMutation.isPending;

    // ─── Render ──────────────────────────────────
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Offers</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage promotional offers for your business</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Offer
                </button>
            </div>

            {/* ─── Create/Edit Form ──────────────────── */}
            {showForm && (
                <div className="mb-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                        </h2>
                        <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Banner Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Banner Image</label>
                            {bannerPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-48">
                                    <Image src={bannerPreview} alt="Banner" fill className="object-cover" unoptimized={bannerPreview.startsWith('blob:')} />
                                    <button
                                        type="button"
                                        onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">Click to upload banner</span>
                                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</span>
                                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g., Diwali Sale - 50% OFF on All Electronics"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {OFFER_CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Describe the offer in detail..."
                                rows={3}
                                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    <IndianRupee className="inline w-3.5 h-3.5 mr-1" />Original Price
                                </label>
                                <input
                                    type="number"
                                    value={form.originalPrice}
                                    onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))}
                                    placeholder="₹0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    <Tag className="inline w-3.5 h-3.5 mr-1" />Offer Price
                                </label>
                                <input
                                    type="number"
                                    value={form.offerPrice}
                                    onChange={e => setForm(p => ({ ...p, offerPrice: e.target.value }))}
                                    placeholder="₹0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    <Percent className="inline w-3.5 h-3.5 mr-1" />Discount %
                                </label>
                                <div className="px-4 py-2.5 border rounded-xl text-sm bg-slate-50 text-slate-600">
                                    {form.originalPrice && form.offerPrice && parseFloat(form.originalPrice) > 0
                                        ? `${Math.round(((parseFloat(form.originalPrice) - parseFloat(form.offerPrice)) / parseFloat(form.originalPrice)) * 100)}%`
                                        : '—'}
                                </div>
                            </div>
                        </div>

                        {/* Validity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    <Calendar className="inline w-3.5 h-3.5 mr-1" />Valid From
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.validFrom}
                                    onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))}
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    <Calendar className="inline w-3.5 h-3.5 mr-1" />Valid Until
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.validUntil}
                                    onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))}
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-slate-700">
                                    <MapPin className="inline w-3.5 h-3.5 mr-1" />Location <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={isLocating}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                                >
                                    <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse' : ''}`} />
                                    {isLocating ? 'Detecting...' : 'Use My Location'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="number"
                                    value={form.latitude}
                                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                                    placeholder="Latitude (e.g., 12.9716)"
                                    step="any"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                    required
                                />
                                <input
                                    type="number"
                                    value={form.longitude}
                                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                                    placeholder="Longitude (e.g., 77.5946)"
                                    step="any"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                    required
                                />
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                    placeholder="Address (human-readable)"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Tags & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
                                <input
                                    type="text"
                                    value={form.tags}
                                    onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                    placeholder="sale, diwali, discount (comma-separated)"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Phone</label>
                                <input
                                    type="text"
                                    value={form.contactPhone}
                                    onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
                                <input
                                    type="email"
                                    value={form.contactEmail}
                                    onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                                    placeholder="offers@mybusiness.com"
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Terms & Conditions</label>
                            <textarea
                                value={form.termsAndConditions}
                                onChange={e => setForm(p => ({ ...p, termsAndConditions: e.target.value }))}
                                placeholder="Any terms and conditions that apply..."
                                rows={2}
                                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                {editingOffer ? 'Update Offer' : 'Create Offer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ─── Offers List ──────────────────────── */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border rounded-2xl p-4 animate-pulse">
                            <div className="h-40 bg-slate-200 rounded-xl mb-4" />
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
                    <Tag className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">No offers yet</h3>
                    <p className="text-sm text-slate-500 mb-6">Create your first offer to start attracting customers nearby</p>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Your First Offer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map((offer) => {
                        const offerId = offer._id || offer.id;
                        const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.draft;
                        const StatusIcon = statusConfig.icon;
                        const discount = discountDisplay(offer);

                        return (
                            <div key={offerId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                                {/* Banner */}
                                <div className="relative h-40 bg-linear-to-br from-slate-100 to-slate-50">
                                    {offer.bannerUrl ? (
                                        <Image
                                            src={offer.bannerUrl}
                                            alt={offer.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <ImageIcon className="w-10 h-10 text-slate-300" />
                                        </div>
                                    )}
                                    {/* Status badge */}
                                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusConfig.label}
                                    </span>
                                    {/* Discount badge */}
                                    {discount && (
                                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                            {discount}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{offer.title}</h3>
                                    {offer.description && (
                                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{offer.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                            <Tag className="w-3 h-3" />
                                            {OFFER_CATEGORIES.find(c => c.value === offer.category)?.label || offer.category}
                                        </span>
                                        {offer.address && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-xs">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate max-w-[120px]">{offer.address}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    {(offer.originalPrice || offer.offerPrice) && (
                                        <div className="flex items-baseline gap-2 mb-3">
                                            {offer.offerPrice && (
                                                <span className="text-lg font-bold text-slate-900">₹{offer.offerPrice.toLocaleString()}</span>
                                            )}
                                            {offer.originalPrice && offer.offerPrice && (
                                                <span className="text-sm text-slate-400 line-through">₹{offer.originalPrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Validity */}
                                    {offer.validUntil && (
                                        <p className="text-xs text-slate-400 mb-3">
                                            <Calendar className="inline w-3 h-3 mr-1" />
                                            Valid until {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                                        <button
                                            onClick={() => openEditForm(offer)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        {deleteConfirm === offerId ? (
                                            <div className="flex-1 flex gap-1">
                                                <button
                                                    onClick={() => deleteMutation.mutate(offerId)}
                                                    disabled={deleteMutation.isPending}
                                                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="px-2 py-2 text-xs text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(offerId)}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
