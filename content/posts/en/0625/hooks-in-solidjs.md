---
title: "SolidJS Hooks: How to Separate Presentation from Logic"
description: A refactoring adventure with Custom Hooks in SolidJS for clean, maintainable code
date: 2025-06-08
tags: ["web", "solidjs", "hooks", "refactoring"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0625/hooks-in-solidjs"
---

A topic that's been on my mind for a while: How do you actually separate presentation from logic in SolidJS? <!-- endOfPreview -->In this article, I'll show you how Custom Hooks can help transform a 400-line monster into a clean, maintainable component.

#### The Problem: Everything in One Component

You know the feeling? You start with a simple component, and suddenly it does everything:

-   State management
-   API calls
-   Event handling
-   UI rendering
-   Validation
-   DOM manipulation

I recently had such a component - a calendar dialog with over 400 lines of code. A real monster! 🐉

```javascript
const CalendarDialog = () => {
    // 15 different signals and stores
    const [calendarEntry, setCalendarEntry] = createStore(/* ... */);
    const [originalEntry, setOriginalEntry] = createSignal(null);
    const [isDeleting, setIsDeleting] = createSignal(false);
    // ... and 12 more

    // API calls directly in component
    const handleSave = async () => {
        const response = await saveCalendarEntry(calendarEntry);
        if (response?.ok) {
            // DOM manipulation
            document.getElementById("snackbar")?.dispatchEvent(/* ... */);
            // Event dispatching
            window.dispatchEvent(new Event("calendar:reload"));
        }
    };

    // 200 lines of JSX with repetitive code
    return (
        <div>
            <input
                attr:outline-color={
                    isFieldChanged(calendarEntry, ["title"])
                        ? "#eb6914"
                        : undefined
                }
            />
            <input
                attr:outline-color={
                    isFieldChanged(calendarEntry, ["description"])
                        ? "#eb6914"
                        : undefined
                }
            />
            {/* ... 20 more inputs with the same logic */}
        </div>
    );
};
```

**The problem:** Everything is coupled, nothing is testable, and changes become a nightmare.

#### The Solution: Custom Hooks

The idea is simple: We extract all business logic into a Custom Hook. The component only takes care of rendering.

##### Installation and Setup

For our refactoring, we actually only need SolidJS - but I'll also show you how to structure it:

```bash
mkdir hooks
touch hooks/useCalendarEntry.js
touch hooks/useFieldValidation.js
```

##### The Custom Hook: useCalendarEntry

Here's the core of our solution:

```javascript
// hooks/useCalendarEntry.js
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import {
    saveCalendarEntry,
    editCalendarEntry,
    deleteCalendarEntry,
} from "../api/calendar-api";

const initialEntry = {
    title: "",
    description: "",
    contactPerson: {
        name: "",
        email: "",
        phone: "",
    },
    publishDate: null,
    deadlineDate: null,
};

export const useCalendarEntry = () => {
    const [entry, setEntry] = createStore(structuredClone(initialEntry));
    const [originalEntry, setOriginalEntry] = createSignal(null);
    const [isLoading, setIsLoading] = createSignal(false);
    const [isEditing, setIsEditing] = createSignal(false);
    const [showDeleteButton, setShowDeleteButton] = createSignal(false);

    // Entry Management
    const resetEntry = () => {
        setEntry(structuredClone(initialEntry));
        setOriginalEntry(null);
        setIsLoading(false);
        setIsEditing(false);
        setShowDeleteButton(false);
    };

    const loadEntry = (data) => {
        resetEntry();

        if (!data) return; // New entry

        if (data.id) {
            // Edit existing entry
            setEntry(data);
            setIsEditing(true);
            setShowDeleteButton(true);
        } else {
            // New entry with template
            setEntry(data);
            // IMPORTANT: Deep clone for comparison!
            setOriginalEntry(structuredClone(data));
        }
    };

    // API Operations with structured returns
    const saveEntry = async () => {
        setIsLoading(true);

        try {
            const response = isEditing()
                ? await editCalendarEntry(entry)
                : await saveCalendarEntry(entry);

            if (response?.ok) {
                return { success: true, message: "Entry saved" };
            }
            return { success: false, error: "Save failed" };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEntry = async () => {
        setIsLoading(true);

        try {
            const response = await deleteCalendarEntry(entry.id);
            return response?.ok
                ? { success: true, message: "Entry deleted" }
                : { success: false, error: "Delete failed" };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Utility Functions
    const updateContactPerson = (field, value) => {
        setEntry("contactPerson", {
            ...entry.contactPerson,
            [field]: value,
        });
    };

    const safeString = (value) => value || "";

    return {
        // State
        entry,
        originalEntry,
        isLoading,
        isEditing,
        showDeleteButton,

        // Actions
        setEntry,
        loadEntry,
        resetEntry,
        saveEntry,
        deleteEntry,
        updateContactPerson,

        // Utils
        safeString,
    };
};
```

##### Extracting Helper Functions

For field validation and styling:

```javascript
// utils/fieldValidation.js
export const getByPath = (obj, path) => {
    return path.reduce((current, key) => current?.[key], obj);
};

export const hasFieldChanged = (current, original, fieldPath) => {
    if (!original) return false;

    const currentValue = getByPath(current, fieldPath);
    const originalValue = getByPath(original, fieldPath);

    return originalValue && currentValue !== originalValue;
};

export const getFieldOutlineColor = (
    currentEntry,
    originalEntry,
    fieldPath,
    changeColor = "#eb6914",
) => {
    // Case 1: Editing with original property
    if (currentEntry.id && currentEntry.original) {
        const currentValue = getByPath(currentEntry, fieldPath);
        const originalValue = getByPath(currentEntry.original, fieldPath);
        return currentValue !== originalValue ? changeColor : undefined;
    }

    // Case 2: New entry with template
    if (hasFieldChanged(currentEntry, originalEntry, fieldPath)) {
        return changeColor;
    }

    return undefined;
};
```

##### The Refactored Component

Now the component becomes really beautiful:

{% raw %}

```javascript
// CalendarDialog.jsx
import { onMount, onCleanup, Show } from "solid-js";
import { useCalendarEntry } from "../hooks/useCalendarEntry";
import { getFieldOutlineColor } from "../utils/fieldValidation";

const CalendarDialog = () => {
    let dialogRef;

    const {
        entry,
        originalEntry,
        isLoading,
        isEditing,
        showDeleteButton,
        setEntry,
        loadEntry,
        resetEntry,
        saveEntry,
        deleteEntry,
        updateContactPerson,
        safeString,
    } = useCalendarEntry();

    // UI Helper - much cleaner now!
    const getOutlineColor = (fieldPath) =>
        getFieldOutlineColor(entry, originalEntry(), fieldPath);

    // Event Handlers - only UI logic now
    const handleDialogOpen = (event) => {
        loadEntry(event.detail);
    };

    const handleSave = async () => {
        const result = await saveEntry();

        if (result.success) {
            closeDialog();
            showNotification(result.message);
            window.dispatchEvent(new Event("calendar:reload"));
        } else {
            showNotification(result.error, "error");
        }
    };

    const handleDelete = async () => {
        const result = await deleteEntry();

        if (result.success) {
            closeDialog();
            showNotification(result.message);
            window.dispatchEvent(new Event("calendar:reload"));
        } else {
            showNotification(result.error, "error");
        }
    };

    const closeDialog = () => {
        dialogRef?.dispatchEvent(new Event("dialog:close"));
        resetEntry();
    };

    const showNotification = (message, type = "success") => {
        const snackbar = document.getElementById("snackbar");
        snackbar?.dispatchEvent(
            new CustomEvent("snackbar:open", {
                detail: { message, type },
            }),
        );
    };

    // Lifecycle
    onMount(() => {
        dialogRef?.addEventListener("dialog:open", handleDialogOpen);
    });

    onCleanup(() => {
        dialogRef?.removeEventListener("dialog:open", handleDialogOpen);
    });

    return (
        <dialog ref={dialogRef}>
            <h2>Calendar Entry</h2>

            <div class="form-row">
                <input
                    placeholder="Title"
                    value={safeString(entry.title)}
                    onInput={(e) => setEntry("title", e.target.value)}
                    style={{ "outline-color": getOutlineColor(["title"]) }}
                    disabled={isLoading()}
                />

                <input
                    placeholder="Contact Person"
                    value={safeString(entry.contactPerson?.name)}
                    onInput={(e) => updateContactPerson("name", e.target.value)}
                    style={{
                        "outline-color": getOutlineColor([
                            "contactPerson",
                            "name",
                        ]),
                    }}
                    disabled={isLoading()}
                />
            </div>

            <div class="form-row">
                <input
                    placeholder="Description"
                    value={safeString(entry.description)}
                    onInput={(e) => setEntry("description", e.target.value)}
                    style={{
                        "outline-color": getOutlineColor(["description"]),
                    }}
                    disabled={isLoading()}
                />

                <input
                    placeholder="Email"
                    value={safeString(entry.contactPerson?.email)}
                    onInput={(e) =>
                        updateContactPerson("email", e.target.value)
                    }
                    style={{
                        "outline-color": getOutlineColor([
                            "contactPerson",
                            "email",
                        ]),
                    }}
                    disabled={isLoading()}
                />
            </div>

            <div class="actions">
                <Show when={showDeleteButton()}>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading()}
                        class="btn-danger"
                    >
                        {isLoading() ? "Deleting..." : "Delete"}
                    </button>
                </Show>

                <button
                    onClick={closeDialog}
                    disabled={isLoading()}
                    class="btn-secondary"
                >
                    Cancel
                </button>

                <button
                    onClick={handleSave}
                    disabled={isLoading()}
                    class="btn-primary"
                >
                    {isLoading()
                        ? "Saving..."
                        : isEditing()
                          ? "Save"
                          : "Create"}
                </button>
            </div>
        </dialog>
    );
};

export default CalendarDialog;
```

{% endraw %}

#### What Have We Achieved?

##### Before vs. After

**Before:**

-   400+ line monster component
-   Everything coupled
-   12x the same `getOutlineColor` call
-   Not testable
-   Hard to understand

**After:**

-   Hook: 120 lines of pure logic
-   Component: 80 lines of pure UI
-   Utilities: 30 lines of reusable helpers
-   Everything testable
-   Clear separation of concerns

##### The Benefits in Detail

**1. Separation of Concerns**

```javascript
// Business logic in hook
const { saveEntry, deleteEntry } = useCalendarEntry();

// UI logic in component
const handleSave = async () => {
    const result = await saveEntry();
    // Only UI feedback
};
```

**2. Reusability**

```javascript
// Hook can be used anywhere
const AnotherComponent = () => {
    const { entry, setEntry } = useCalendarEntry();
    // Completely different UI, same logic
};
```

**3. Testability**

```javascript
// Test hook in isolation
const { result } = renderHook(() => useCalendarEntry());
act(() => result.current.setEntry("title", "Test"));
expect(result.current.entry.title).toBe("Test");
```

**4. DRY Principle**

```javascript
// Instead of 12x the same thing
const getOutlineColor = (fieldPath) =>
    getFieldOutlineColor(entry, originalEntry(), fieldPath);
```

#### Conclusion

Custom Hooks in SolidJS are a game-changer for code organization. They help with:

-   **Separating logic from UI**
-   **Making code reusable**
-   **Writing tests**
-   **Keeping components readable**

The refactoring from 400 lines to 3 small, focused modules was one of the most satisfying coding sessions I've had.

The trick is to ask yourself: _"What is business logic and what is UI?"_ Everything that's not directly related to rendering belongs in the hook.

**Bonus tip:** Start small! Take a component that annoys you and just extract the state. The rest will follow naturally.

Thanks a ton for reading!

Kuba
