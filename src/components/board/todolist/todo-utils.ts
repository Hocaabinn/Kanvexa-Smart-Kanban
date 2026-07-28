"use client";

export interface ParsedCardMeta {
    dueDate: string | null;
    dueTime: string | null;
    assignee: string | null;
    notes: string | null;
}

export interface ParsedCardTitle {
    mainTitle: string;
    meta: ParsedCardMeta | null;
}

export function parseCardTitle(rawTitle: string): ParsedCardTitle {
    const match = rawTitle.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    if (!match) return { mainTitle: rawTitle, meta: null };

    const mainTitle = match[1].trim() || rawTitle;
    const metaStr = match[2];

    if (!metaStr) return { mainTitle, meta: null };

    let dueDate: string | null = null;
    let dueTime: string | null = null;
    let assignee: string | null = null;
    let notes: string | null = null;

    const parts = metaStr.split("•").map(p => p.trim());
    for (const part of parts) {
        if (part.startsWith("📅")) {
            dueDate = part.replace("📅", "").trim();
        } else if (part.startsWith("⏰")) {
            dueTime = part.replace("⏰", "").trim();
        } else if (part.startsWith("👤")) {
            assignee = part.replace("👤", "").trim();
        } else if (part.startsWith("📝")) {
            notes = part.replace("📝", "").trim();
        } else if (part.length > 0) {
            notes = notes ? `${notes} • ${part}` : part;
        }
    }

    const hasMeta = Boolean(dueDate || dueTime || assignee || notes);
    return {
        mainTitle,
        meta: hasMeta ? { dueDate, dueTime, assignee, notes } : null,
    };
}
