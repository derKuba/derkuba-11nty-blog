---
title: "SolidJS-Hooks: Wie man Darstellung von Logik trennt"
description: Ein Refactoring-Abenteuer mit Custom Hooks in SolidJS für sauberen, wartbaren Code
date: 2025-06-08
tags: ["web", "solidjs", "hooks", "refactoring"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0625/hooks-in-solidjs"
---

Ein Thema, das mir schon länger auf den Nägeln brennt: Wie trennt man eigentlich Darstellung von Logik in SolidJS? <!-- endOfPreview -->In diesem Artikel zeige ich dir, wie Custom Hooks dabei helfen können, aus einem 400-Zeilen-Monster eine saubere, wartbare Komponente zu machen.

#### Das Problem: Alles in einer Komponente

Kennst du das? Du fängst mit einer einfachen Komponente an, und plötzlich macht sie alles:

-   State-Management
-   API-Calls
-   Event-Handling
-   UI-Rendering
-   Validierung
-   DOM-Manipulation

Ich hatte kürzlich so eine Komponente - einen Kalender-Dialog mit über 400 Zeilen Code. Ein echtes Monster!

```javascript
const CalendarDialog = () => {
    // 15 verschiedene Signals und Stores
    const [calendarEntry, setCalendarEntry] = createStore(/* ... */);
    const [originalEntry, setOriginalEntry] = createSignal(null);
    const [isDeleting, setIsDeleting] = createSignal(false);
    // ... und noch 12 weitere

    // API-Calls direkt in der Komponente
    const handleSave = async () => {
        const response = await saveCalendarEntry(calendarEntry);
        if (response?.ok) {
            // DOM-Manipulation
            document.getElementById("snackbar")?.dispatchEvent(/* ... */);
            // Event-Dispatching
            window.dispatchEvent(new Event("calendar:reload"));
        }
    };

    // 200 Zeilen JSX mit repeating Code
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
            {/* ... 20 weitere Inputs mit der gleichen Logik */}
        </div>
    );
};
```

**Das Problem:** Alles ist gekoppelt, nichts ist testbar, und Änderungen werden zum Alptraum.

#### Die Lösung: Custom Hooks

Die Idee ist simpel: Wir lagern die gesamte Business-Logik in einen Custom Hook aus. Die Komponente kümmert sich nur noch um die Darstellung.

##### Installation und Setup

Für unser Refactoring brauchen wir eigentlich nur SolidJS - aber ich zeige dir auch, wie du es strukturierst:

```bash
mkdir hooks
touch hooks/useCalendarEntry.js
touch hooks/useFieldValidation.js
```

##### Der Custom Hook: useCalendarEntry

Hier kommt der Kern unserer Lösung:

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

        if (!data) return; // Neuer Eintrag

        if (data.id) {
            // Bestehenden Eintrag bearbeiten
            setEntry(data);
            setIsEditing(true);
            setShowDeleteButton(true);
        } else {
            // Neuer Eintrag mit Vorlage
            setEntry(data);
            // WICHTIG: Deep Clone für Vergleich!
            setOriginalEntry(structuredClone(data));
        }
    };

    // API Operations mit strukturierten Rückgaben
    const saveEntry = async () => {
        setIsLoading(true);

        try {
            const response = isEditing()
                ? await editCalendarEntry(entry)
                : await saveCalendarEntry(entry);

            if (response?.ok) {
                return { success: true, message: "Eintrag gespeichert" };
            }
            return { success: false, error: "Speichern fehlgeschlagen" };
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
                ? { success: true, message: "Eintrag gelöscht" }
                : { success: false, error: "Löschen fehlgeschlagen" };
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

##### Helper-Funktionen auslagern

Für die Feld-Validierung und Styling:

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
    // Fall 1: Bearbeitung mit original-Property
    if (currentEntry.id && currentEntry.original) {
        const currentValue = getByPath(currentEntry, fieldPath);
        const originalValue = getByPath(currentEntry.original, fieldPath);
        return currentValue !== originalValue ? changeColor : undefined;
    }

    // Fall 2: Neuer Eintrag mit Template
    if (hasFieldChanged(currentEntry, originalEntry, fieldPath)) {
        return changeColor;
    }

    return undefined;
};
```

##### Die refactored Komponente

Jetzt wird die Komponente richtig schön:

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

    // UI Helper - jetzt viel sauberer!
    const getOutlineColor = (fieldPath) =>
        getFieldOutlineColor(entry, originalEntry(), fieldPath);

    // Event Handlers - nur noch UI-Logik
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
            <h2>Kalendereintrag</h2>

            <div class="form-row">
                <input
                    placeholder="Titel"
                    value={safeString(entry.title)}
                    onInput={(e) => setEntry("title", e.target.value)}
                    style={{
                        "outline-color": getOutlineColor(["title"]),
                    }}
                    disabled={isLoading()}
                />

                <input
                    placeholder="Kontaktperson"
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
                    placeholder="Beschreibung"
                    value={safeString(entry.description)}
                    onInput={(e) => setEntry("description", e.target.value)}
                    style={{
                        "outline-color": getOutlineColor(["description"]),
                    }}
                    disabled={isLoading()}
                />

                <input
                    placeholder="E-Mail"
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
                        {isLoading() ? "Wird gelöscht..." : "Löschen"}
                    </button>
                </Show>

                <button
                    onClick={closeDialog}
                    disabled={isLoading()}
                    class="btn-secondary"
                >
                    Abbrechen
                </button>

                <button
                    onClick={handleSave}
                    disabled={isLoading()}
                    class="btn-primary"
                >
                    {isLoading()
                        ? "Wird gespeichert..."
                        : isEditing()
                          ? "Speichern"
                          : "Erstellen"}
                </button>
            </div>
        </dialog>
    );
};

export default CalendarDialog;
```

{% endraw %}

#### Was haben wir erreicht?

##### Vorher vs. Nachher

**Vorher:**

-   400+ Zeilen Monster-Komponente
-   Alles gekoppelt
-   12x derselbe `getOutlineColor` Aufruf
-   Nicht testbar
-   Schwer zu verstehen

**Nachher:**

-   Hook: 120 Zeilen pure Logik
-   Komponente: 80 Zeilen pure UI
-   Utilities: 30 Zeilen wiederverwendbare Helfer
-   Alles testbar
-   Klar getrennte Verantwortlichkeiten

##### Die Vorteile im Detail

**1. Separation of Concerns**

```javascript
// Business Logic im Hook
const { saveEntry, deleteEntry } = useCalendarEntry();

// UI Logic in der Komponente
const handleSave = async () => {
    const result = await saveEntry();
    // Nur UI-Feedback
};
```

**2. Wiederverwendbarkeit**

```javascript
// Der Hook kann überall verwendet werden
const AnotherComponent = () => {
    const { entry, setEntry } = useCalendarEntry();
    // Komplett andere UI, gleiche Logik
};
```

**3. Testbarkeit**

```javascript
// Hook isoliert testen
const { result } = renderHook(() => useCalendarEntry());
act(() => result.current.setEntry("title", "Test"));
expect(result.current.entry.title).toBe("Test");
```

**4. DRY-Prinzip**

```javascript
// Statt 12x das Gleiche
const getOutlineColor = (fieldPath) =>
    getFieldOutlineColor(entry, originalEntry(), fieldPath);
```

#### Fazit

Custom Hooks in SolidJS sind ein Game-Changer für die Code-Organisation. Sie helfen dabei:

-   **Logik von UI zu trennen**
-   **Code wiederverwendbar zu machen**
-   **Tests zu schreiben**
-   **Komponenten lesbar zu halten**

Das Refactoring von 400 Zeilen auf 3 kleine, fokussierte Module war eine der befriedigendsten Code-Sessions, die ich hatte.

Der Trick liegt darin, sich zu fragen: _"Was ist Business Logic und was ist UI?"_ Alles was nicht direkt mit Rendering zu tun hat, gehört in den Hook.

**Bonustipp:** Fangt klein an! Nehmt eine Komponente, die euch ärgert, und lagert nur den State aus. Der Rest folgt von selbst.

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba

PS: Dieser Artikel wurde mit Hilfe KI sprachlich aufgehübscht.
