'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { businessApi, type Business } from '@/lib/api';

// ===== TYPES =====

interface RequiredFieldConfig {
    /** Database field name */
    field: string;
    /** Display label */
    label: string;
    /** Description shown in the modal */
    description: string;
    /** The component to render for collecting this field */
    component: 'pill-selector' | 'text-input';
    /** Options for pill-selector */
    options?: string[];
    /** Placeholder for text-input */
    placeholder?: string;
}

interface RequiredDataModalProps {
    /** Business ID to update */
    businessId: string;
    /** The business data object */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    businessData: Record<string, any> | null;
    /** Array of required field configurations */
    requiredFields: RequiredFieldConfig[];
    /** Children to render when all required fields are present */
    children: React.ReactNode;
    /** Callback after data is saved successfully */
    onComplete?: () => void;
}

// ===== INDUSTRY OPTIONS (shared constant) =====

export const INDUSTRY_OPTIONS = [
    '☕ Café / Coffee Shop',
    '🍽️ Restaurant',
    '🏨 Hotel / Hospitality',
    '💇 Salon / Spa',
    '🏋️ Gym / Fitness',
    '🛒 Retail Store',
    '🏥 Healthcare / Clinic',
    '📚 Education',
    '💼 Coworking Space',
    '🏢 Real Estate',
    '🚗 Automotive',
    '🎨 Creative Agency',
    '💻 Tech / SaaS',
    '🎵 Entertainment',
    '🏖️ Travel / Tourism',
    '🛠️ Home Services',
    '📦 E-commerce',
    '🔧 Other',
];

// ===== DEFAULT FIELD CONFIGURATIONS =====

export const defaultRequiredFields: RequiredFieldConfig[] = [
    {
        field: 'industryType',
        label: 'Industry Type',
        description: 'Help us personalize your experience by selecting your industry.',
        component: 'pill-selector',
        options: INDUSTRY_OPTIONS,
    },
];

// ===== MAIN COMPONENT =====

export function RequiredDataModal({
    businessId,
    businessData,
    requiredFields,
    children,
    onComplete,
}: RequiredDataModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [showModal, setShowModal] = useState(false);
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

    // Determine which fields are missing
    const getMissingFields = useCallback(() => {
        if (!businessData) return [];
        return requiredFields.filter(
            (field) => !businessData[field.field] || businessData[field.field] === ''
        );
    }, [businessData, requiredFields]);

    useEffect(() => {
        const missing = getMissingFields();
        setShowModal(missing.length > 0 && !!businessData);
        setCurrentFieldIndex(0);
    }, [businessData, getMissingFields]);

    const missingFields = getMissingFields();

    if (!showModal || missingFields.length === 0) {
        return <>{children}</>;
    }

    const currentField = missingFields[currentFieldIndex];
    const currentValue = fieldValues[currentField.field] || '';

    const handleFieldChange = (value: string) => {
        setFieldValues((prev) => ({
            ...prev,
            [currentField.field]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!currentValue) {
            toast({
                title: 'Required',
                description: `Please complete the ${currentField.label.toLowerCase()} field.`,
                variant: 'destructive',
            });
            return;
        }

        // If there are more fields to fill, advance to next
        if (currentFieldIndex < missingFields.length - 1) {
            setCurrentFieldIndex(currentFieldIndex + 1);
            return;
        }

        // All fields filled - submit to API
        setIsSubmitting(true);
        try {
            const updatePayload: Record<string, string> = {};
            for (const field of missingFields) {
                updatePayload[field.field] = fieldValues[field.field];
            }

            await businessApi.update(businessId, updatePayload as Partial<Business>);

            toast({
                title: 'Profile Updated',
                description: 'Thank you for completing your profile!',
            });

            setShowModal(false);
            onComplete?.();
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: 'Update Failed',
                description: err.message || 'Something went wrong.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop - blocks all interaction */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                {/* Modal */}
                <div
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                    style={{ animation: 'modal-enter 0.3s ease-out' }}
                >
                    {/* Gradient header accent */}
                    <div className="h-1.5 bg-linear-to-r from-primary via-primary/80 to-primary/40" />

                    <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Complete Your Profile
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {currentField.description}
                                </p>
                            </div>
                            {/* No close button - this is a blocking modal */}
                        </div>

                        {/* Progress indicator */}
                        {missingFields.length > 1 && (
                            <div className="flex items-center gap-2 mb-6">
                                {missingFields.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${idx <= currentFieldIndex
                                            ? 'bg-primary'
                                            : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                                <span className="text-xs text-muted-foreground ml-2">
                                    {currentFieldIndex + 1} / {missingFields.length}
                                </span>
                            </div>
                        )}

                        {/* Field label */}
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {currentField.label}
                        </label>

                        {/* Field renderer */}
                        {currentField.component === 'pill-selector' && currentField.options && (
                            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1 pb-2 scrollbar-thin">
                                {currentField.options.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleFieldChange(option)}
                                        className={`
                                            px-3.5 py-2 rounded-full text-sm font-medium
                                            border transition-all duration-200 cursor-pointer
                                            focus:outline-none focus:ring-2 focus:ring-primary/40
                                            ${currentValue === option
                                                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.03]'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-primary/40 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentField.component === 'text-input' && (
                            <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleFieldChange(e.target.value)}
                                placeholder={currentField.placeholder || `Enter ${currentField.label.toLowerCase()}`}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                            />
                        )}

                        {/* Submit button */}
                        <div className="mt-6">
                            <Button
                                onClick={handleSubmit}
                                disabled={!currentValue || isSubmitting}
                                className="w-full rounded-2xl py-5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium text-base"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : currentFieldIndex < missingFields.length - 1 ? (
                                    'Continue'
                                ) : (
                                    'Save & Continue'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render children behind the modal (visible but non-interactive) */}
            <div className="pointer-events-none opacity-50">
                {children}
            </div>

            {/* Animation keyframe */}
            <style jsx>{`
                @keyframes modal-enter {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
