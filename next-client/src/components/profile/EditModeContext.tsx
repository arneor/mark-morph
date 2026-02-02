import { createContext, useContext, useState, ReactNode } from "react";

interface EditModeContextType {
    isEditMode: boolean;
    setIsEditMode: (value: boolean) => void;
    toggleEditMode: () => void;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (value: boolean) => void;
    isSaving: boolean;
    setIsSaving: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const toggleEditMode = () => {
        if (isEditMode && hasUnsavedChanges) {
            // Show confirmation before exiting edit mode with unsaved changes
            const confirmExit = window.confirm(
                "You have unsaved changes. Are you sure you want to exit edit mode?"
            );
            if (!confirmExit) return;
            setHasUnsavedChanges(false);
        }
        setIsEditMode(!isEditMode);
    };

    return (
        <EditModeContext.Provider
            value={{
                isEditMode,
                setIsEditMode,
                toggleEditMode,
                hasUnsavedChanges,
                setHasUnsavedChanges,
                isSaving,
                setIsSaving,
            }}
        >
            {children}
        </EditModeContext.Provider>
    );
}

export function useEditMode() {
    const context = useContext(EditModeContext);
    if (!context) {
        throw new Error("useEditMode must be used within an EditModeProvider");
    }
    return context;
}
