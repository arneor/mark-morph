'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { offersApi, type Offer, type NearbyOffersResponse } from '@/lib/api';
import Image from 'next/image';
import {
    MapPin,
    Search,
    Filter,
    X,
    ChevronDown,
    Tag,
    Calendar,
    AlertCircle,
    Navigation,
    Loader2,
    IndianRupee,
    Clock,
    SlidersHorizontal,
    MapPinOff,
    ExternalLink,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────
const OFFER_CATEGORIES = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tv', label: 'TV' },
    { value: 'fridge', label: 'Fridge' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'health', label: 'Health' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' },
    { value: 'toys', label: 'Toys' },
    { value: 'automotive', label: 'Auto' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' },
];

const DISTANCE_OPTIONS = [
    { value: 1, label: '1 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
];

type LocationState = 'pending' | 'granted' | 'denied' | 'error' | 'unsupported';

// ─── Main Component ──────────────────────────────
export default function NearMePage() {
    // Location state
    const [locationState, setLocationState] = useState<LocationState>('pending');
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLng, setUserLng] = useState<number | null>(null);
    const [locationError, setLocationError] = useState<string>('');

    // Data state
    const [offers, setOffers] = useState<Offer[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Filter state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [maxDistanceKm, setMaxDistanceKm] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    // Search debounce
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ─── Location Permission ─────────────────────
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationState('unsupported');
            return;
        }

        setLocationState('pending');

        const onSuccess = (position: GeolocationPosition) => {
            setUserLat(position.coords.latitude);
            setUserLng(position.coords.longitude);
            setLocationState('granted');
        };

        const onFinalError = (error: GeolocationPositionError) => {
            if (error.code === error.PERMISSION_DENIED) {
                setLocationState('denied');
                setLocationError('Location access was denied. Please enable it in your browser settings.');
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                setLocationState('error');
                setLocationError('Unable to determine your location. Please check your device settings.');
            } else {
                setLocationState('error');
                setLocationError('Location request timed out. Please try again.');
            }
        };

        // First attempt: high accuracy with generous timeout
        navigator.geolocation.getCurrentPosition(
            onSuccess,
            () => {
                // Fallback: low accuracy with cached position allowed
                navigator.geolocation.getCurrentPosition(
                    onSuccess,
                    onFinalError,
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
                );
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 300000 }
        );
    }, []);

    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    // ─── Debounced Search ────────────────────────
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [search]);

    // ─── Fetch Offers ────────────────────────────
    const fetchOffers = useCallback(async (pageNum: number, append: boolean = false) => {
        if (userLat === null || userLng === null) return;

        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const result: NearbyOffersResponse = await offersApi.getNearby({
                latitude: userLat,
                longitude: userLng,
                maxDistanceKm,
                category: selectedCategory || undefined,
                search: debouncedSearch || undefined,
                page: pageNum,
                limit: 12,
            });

            if (append) {
                setOffers(prev => [...prev, ...result.offers]);
            } else {
                setOffers(result.offers);
            }
            setTotal(result.total);
            setPage(result.page);
            setTotalPages(result.totalPages);
        } catch (err) {
            console.error('Failed to fetch nearby offers:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [userLat, userLng, maxDistanceKm, selectedCategory, debouncedSearch]);

    // Re-fetch when location or filters change
    useEffect(() => {
        if (locationState === 'granted') {
            fetchOffers(1);
        }
    }, [locationState, fetchOffers]);

    // ─── Distance Calculation ────────────────────
    const calcDistance = useCallback((offerLng: number, offerLat: number) => {
        if (userLat === null || userLng === null) return null;
        const R = 6371; // Earth radius in km
        const dLat = (offerLat - userLat) * Math.PI / 180;
        const dLon = (offerLng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(userLat * Math.PI / 180) * Math.cos(offerLat * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)} km`;
    }, [userLat, userLng]);

    const clearFilters = useCallback(() => {
        setSearch('');
        setSelectedCategory('');
        setMaxDistanceKm(10);
    }, []);

    const hasActiveFilters = selectedCategory || debouncedSearch;

    // ─── Location Fallback UI ────────────────────
    if (locationState === 'pending') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Navigation className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Detecting your location...</h1>
                    <p className="text-sm text-slate-500">Please allow location access to discover offers near you</p>
                </div>
            </div>
        );
    }

    if (locationState === 'denied' || locationState === 'error' || locationState === 'unsupported') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center p-8 max-w-md bg-white rounded-3xl shadow-lg border border-slate-100">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
                        <MapPinOff className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">
                        {locationState === 'unsupported' ? 'Location Not Supported' : 'Location Access Required'}
                    </h1>
                    <p className="text-sm text-slate-500 mb-6">
                        {locationState === 'unsupported'
                            ? 'Your browser does not support geolocation. Please use a modern browser.'
                            : locationError || 'We need your location to show nearby offers.'
                        }
                    </p>
                    {locationState !== 'unsupported' && (
                        <div className="space-y-3">
                            <button
                                onClick={requestLocation}
                                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Try Again
                            </button>
                            <div className="text-xs text-slate-400 space-y-1">
                                <p><strong>Chrome:</strong> Settings → Privacy → Site Settings → Location</p>
                                <p><strong>Safari:</strong> Settings → Privacy → Location Services</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── Main UI ─────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50">
            {/* ─── Sticky Header ────────────────────── */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    {/* Title Row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h1 className="text-lg font-bold text-slate-900">Near Me</h1>
                            <span className="text-xs text-slate-400 hidden sm:inline">
                                Powered by <span className="text-primary font-semibold">LinkBeet</span>
                            </span>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search offers, products, stores..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full"
                            >
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        )}
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            {/* Category chips */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${!selectedCategory ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                    >
                                        All
                                    </button>
                                    {OFFER_CATEGORIES.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setSelectedCategory(c.value === selectedCategory ? '' : c.value)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${selectedCategory === c.value ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Distance */}
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Distance</label>
                                <div className="flex gap-1.5">
                                    {DISTANCE_OPTIONS.map(d => (
                                        <button
                                            key={d.value}
                                            onClick={() => setMaxDistanceKm(d.value)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${maxDistanceKm === d.value ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Results ────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Result Count */}
                {!isLoading && locationState === 'granted' && (
                    <p className="text-sm text-slate-500 mb-4">
                        {total > 0 ? (
                            <>Showing <strong className="text-slate-700">{offers.length}</strong> of <strong className="text-slate-700">{total}</strong> offers within <strong className="text-slate-700">{maxDistanceKm} km</strong></>
                        ) : null}
                    </p>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white border rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-44 bg-slate-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <Tag className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 mb-2">No offers found nearby</h2>
                        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                            {hasActiveFilters
                                ? 'Try clearing your filters or widening the search distance.'
                                : `There are no active offers within ${maxDistanceKm} km of your location. Try increasing the distance.`
                            }
                        </p>
                        <div className="flex justify-center gap-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-5 py-2.5 text-sm font-medium bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                            {maxDistanceKm < 50 && (
                                <button
                                    onClick={() => setMaxDistanceKm(50)}
                                    className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    Search within 50 km
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Offer Grid */
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {offers.map((offer) => {
                                const offerId = offer._id || offer.id;
                                const discount = offer.discountPercentage ||
                                    (offer.originalPrice && offer.offerPrice && offer.originalPrice > 0
                                        ? Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100)
                                        : null);
                                const distance = offer.location?.coordinates
                                    ? calcDistance(offer.location.coordinates[0], offer.location.coordinates[1])
                                    : null;

                                return (
                                    <button
                                        key={offerId}
                                        onClick={() => setSelectedOffer(offer)}
                                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group text-left cursor-pointer"
                                    >
                                        {/* Banner */}
                                        <div className="relative h-44 bg-linear-to-br from-slate-100 to-slate-50 overflow-hidden">
                                            {offer.bannerUrl ? (
                                                <Image
                                                    src={offer.bannerUrl}
                                                    alt={offer.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/5 to-primary/10">
                                                    <Tag className="w-10 h-10 text-primary/20" />
                                                </div>
                                            )}
                                            {/* Discount Badge */}
                                            {discount && discount > 0 && (
                                                <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                            {/* Distance Badge */}
                                            {distance && (
                                                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-1 bg-black/60 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                                                    <MapPin className="w-3 h-3" />
                                                    {distance}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            {/* Business name */}
                                            <p className="text-xs text-primary font-semibold mb-1 truncate">
                                                {offer.businessName}
                                            </p>
                                            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 leading-snug">
                                                {offer.title}
                                            </h3>

                                            {/* Category & Address */}
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium">
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {OFFER_CATEGORIES.find(c => c.value === offer.category)?.label || offer.category}
                                                </span>
                                                {offer.address && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px]">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        <span className="truncate max-w-[100px]">{offer.address}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            {(offer.originalPrice || offer.offerPrice) && (
                                                <div className="flex items-baseline gap-2">
                                                    {offer.offerPrice && (
                                                        <span className="text-lg font-bold text-slate-900">
                                                            ₹{offer.offerPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {offer.originalPrice && offer.offerPrice && (
                                                        <span className="text-sm text-slate-400 line-through">
                                                            ₹{offer.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Validity */}
                                            {offer.validUntil && (
                                                <p className="text-[10px] text-slate-400 mt-2">
                                                    <Clock className="inline w-3 h-3 mr-0.5" />
                                                    Valid until {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Load More */}
                        {page < totalPages && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => fetchOffers(page + 1, true)}
                                    disabled={isLoadingMore}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {isLoadingMore ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                    Load More Offers
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ─── Offer Detail Modal ─────────────── */}
            {selectedOffer && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
                    onClick={() => setSelectedOffer(null)}
                >
                    <div
                        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Banner */}
                        {selectedOffer.bannerUrl && (
                            <div className="relative h-56">
                                <Image
                                    src={selectedOffer.bannerUrl}
                                    alt={selectedOffer.title}
                                    fill
                                    className="object-cover sm:rounded-t-2xl"
                                />
                                <button
                                    onClick={() => setSelectedOffer(null)}
                                    className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            {!selectedOffer.bannerUrl && (
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={() => setSelectedOffer(null)}
                                        className="p-2 hover:bg-slate-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            )}

                            {/* Business */}
                            <div className="flex items-center gap-2 mb-3">
                                {selectedOffer.businessLogoUrl && (
                                    <Image
                                        src={selectedOffer.businessLogoUrl}
                                        alt={selectedOffer.businessName}
                                        width={28}
                                        height={28}
                                        className="rounded-full"
                                    />
                                )}
                                <span className="text-sm font-semibold text-primary">{selectedOffer.businessName}</span>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedOffer.title}</h2>

                            {selectedOffer.description && (
                                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{selectedOffer.description}</p>
                            )}

                            {/* Price Section */}
                            {(selectedOffer.originalPrice || selectedOffer.offerPrice) && (
                                <div className="flex items-baseline gap-3 mb-4 p-4 bg-emerald-50 rounded-xl">
                                    {selectedOffer.offerPrice && (
                                        <span className="text-2xl font-bold text-emerald-700">
                                            ₹{selectedOffer.offerPrice.toLocaleString()}
                                        </span>
                                    )}
                                    {selectedOffer.originalPrice && selectedOffer.offerPrice && (
                                        <>
                                            <span className="text-base text-slate-400 line-through">
                                                ₹{selectedOffer.originalPrice.toLocaleString()}
                                            </span>
                                            <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                                                {selectedOffer.discountPercentage || Math.round(((selectedOffer.originalPrice - selectedOffer.offerPrice) / selectedOffer.originalPrice) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2 text-slate-600">
                                    <Tag className="w-4 h-4 mt-0.5 text-slate-400" />
                                    <span>{OFFER_CATEGORIES.find(c => c.value === selectedOffer.category)?.label || selectedOffer.category}</span>
                                </div>
                                {selectedOffer.address && (
                                    <div className="flex items-start gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>{selectedOffer.address}</span>
                                    </div>
                                )}
                                {selectedOffer.validFrom && (
                                    <div className="flex items-start gap-2 text-slate-600">
                                        <Calendar className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>
                                            {new Date(selectedOffer.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {selectedOffer.validUntil && (
                                                <> — {new Date(selectedOffer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                            )}
                                        </span>
                                    </div>
                                )}
                                {selectedOffer.contactPhone && (
                                    <div className="flex items-start gap-2 text-slate-600">
                                        <span className="text-slate-400 mt-0.5">📞</span>
                                        <a href={`tel:${selectedOffer.contactPhone}`} className="text-primary hover:underline">
                                            {selectedOffer.contactPhone}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {selectedOffer.tags && selectedOffer.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {selectedOffer.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* T&C */}
                            {selectedOffer.termsAndConditions && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Terms & Conditions</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">{selectedOffer.termsAndConditions}</p>
                                </div>
                            )}

                            {/* Visit Profile Button */}
                            {selectedOffer.businessUsername && (
                                <div className="mt-5 pt-4 border-t border-slate-100">
                                    <a
                                        href={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.linkbeet.in'}/${selectedOffer.businessUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Visit {selectedOffer.businessName}&apos;s Profile
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
