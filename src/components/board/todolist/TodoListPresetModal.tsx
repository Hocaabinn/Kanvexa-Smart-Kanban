"use client";

import { useState } from "react";
import { Calendar, Clock, User, FileText, MessageSquare, Pin, Sparkles, Paperclip, Upload, X, AlertCircle, BookOpen, Layers } from "lucide-react";
import { createColumnWithCard, createKanbanWorkflow, createPost } from "@/app/board/[id]/actions";
import { PostCategory, getCategoryBadge, formatFileSize } from "../MessageBoard/messageboard-utils";

interface Props {
    boardId: string;
    userEmail?: string;
    presetType: string;
    onClose: () => void;
}

type DocCategory = "PRD" | "Meeting Notes" | "Briefing" | "Technical Spec" | "General";

function getModalTheme(type: string) {
    const lower = type.toLowerCase().trim();
    if (lower.includes("message")) {
        return {
            main: "#db2777",
            bg: "#fdf2f8",
            border: "#fbcfe8",
            shadow: "rgba(219, 39, 119, 0.25)",
        };
    }
    if (lower.includes("doc") || lower.includes("file") || lower.includes("dokumen")) {
        return {
            main: "#6d28d9",
            bg: "#faf5ff",
            border: "#d8b4fe",
            shadow: "rgba(109, 40, 217, 0.25)",
        };
    }
    if (lower.includes("calendar") || lower.includes("kalender")) {
        return {
            main: "#7c3aed",
            bg: "#f5f3ff",
            border: "#ddd6fe",
            shadow: "rgba(124, 58, 237, 0.25)",
        };
    }
    if (lower.includes("review") || lower.includes("peninjauan")) {
        return {
            main: "#2563eb",
            bg: "#eff6ff",
            border: "#bfdbfe",
            shadow: "rgba(37, 99, 235, 0.25)",
        };
    }
    if (lower.includes("proges") || lower.includes("progress") || lower.includes("pengerjaan") || lower.includes("dikerjakan")) {
        return {
            main: "#d97706",
            bg: "#fffbeb",
            border: "#fde68a",
            shadow: "rgba(217, 119, 6, 0.25)",
        };
    }
    if (lower.includes("done") || lower.includes("selesai") || lower.includes("complete")) {
        return {
            main: "#059669",
            bg: "#ecfdf5",
            border: "#a7f3d0",
            shadow: "rgba(5, 150, 105, 0.25)",
        };
    }
    return {
        main: "#7c3aed",
        bg: "#f5f3ff",
        border: "#ddd6fe",
        shadow: "rgba(109, 40, 217, 0.25)",
    };
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default function TodoListPresetModal({ boardId, userEmail = "", presetType, onClose }: Props) {
    const isMessageBoard = presetType.toLowerCase().includes("message");
    const isCalendar = presetType.toLowerCase().includes("calendar") || presetType.toLowerCase().includes("kalender");
    const isDocsFiles = presetType.toLowerCase().includes("doc") || presetType.toLowerCase().includes("file") || presetType.toLowerCase().includes("dokumen");

    const defaultColTitle = presetType.includes("To-Do List") ? "To-dos" : presetType;
    const theme = getModalTheme(presetType);

    const todayIso = new Date().toISOString().split("T")[0];

    // General preset states
    const [presetColTitle, setPresetColTitle] = useState(defaultColTitle);
    const [presetSubTitle, setPresetSubTitle] = useState(isCalendar ? "Deadline Pekerjaan Utama" : "");
    const [presetDueDate, setPresetDueDate] = useState(isCalendar ? todayIso : "");
    const [presetDueTime, setPresetDueTime] = useState(isCalendar ? "17:00" : "");
    const [presetAssignee, setPresetAssignee] = useState("");
    const [presetNotes, setPresetNotes] = useState("");
    
    // Message Board custom states
    const [msgTitle, setMsgTitle] = useState("Pengumuman & Diskusi Tim");
    const [msgContent, setMsgContent] = useState("Selamat datang di Message Board! Silakan bagikan ide, pengumuman, atau pertanyaan untuk tim di sini.");
    const [msgCategory, setMsgCategory] = useState<PostCategory>("announcement");
    const [msgIsPinned, setMsgIsPinned] = useState(true);

    // Docs & Files custom states
    const [docTitle, setDocTitle] = useState("Product Requirement Document (PRD) Tim");
    const [docCategory, setDocCategory] = useState<DocCategory>("PRD");
    const [docContent, setDocContent] = useState("# Product Requirement Document (PRD)\n\n## 📌 Ringkasan Dokumen\nDokumen ini berisi spesifikasi teknis, rancangan alur, dan catatan proyek tim.\n\n### 🎯 Poin Utama\n- Spesifikasi antarmuka pengguna\n- Alur integrasi API dan autentikasi\n- Jadwal peluncuran dan pengujian");

    // File upload state (Message Board & Docs preset)
    const [msgFile, setMsgFile] = useState<File | null>(null);
    const [msgFileError, setMsgFileError] = useState<string | null>(null);
    const [msgUploading, setMsgUploading] = useState(false);
    const [msgUploadProgress, setMsgUploadProgress] = useState<number>(0);
    const [msgUploadedUrl, setMsgUploadedUrl] = useState<string | null>(null);
    const [msgXhrRef, setMsgXhrRef] = useState<XMLHttpRequest | null>(null);

    const [saving, setSaving] = useState(false);

    const handleMsgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            setMsgFileError("Ukuran file melebihi batas maksimum 50 MB!");
            setMsgFile(null);
            return;
        }

        setMsgFileError(null);
        setMsgFile(selectedFile);
        setMsgUploading(true);
        setMsgUploadProgress(0);

        const xhr = new XMLHttpRequest();
        setMsgXhrRef(xhr);

        xhr.open("POST", "/API/upload");

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setMsgUploadProgress(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    setMsgUploadedUrl(data.url);
                    setMsgUploading(false);
                } catch (err) {
                    setMsgFileError("Respon server tidak valid.");
                    setMsgUploading(false);
                    setMsgFile(null);
                }
            } else {
                try {
                    const data = JSON.parse(xhr.responseText);
                    setMsgFileError(data.error || "Gagal mengunggah berkas.");
                } catch (err) {
                    setMsgFileError("Gagal mengunggah berkas.");
                }
                setMsgUploading(false);
                setMsgFile(null);
            }
        };

        xhr.onerror = () => {
            setMsgFileError("Koneksi jaringan bermasalah.");
            setMsgUploading(false);
            setMsgFile(null);
        };

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("boardId", boardId);

        xhr.send(formData);
    };

    const handleCancelMsgFile = () => {
        if (msgXhrRef) {
            msgXhrRef.abort();
            setMsgXhrRef(null);
        }
        setMsgFile(null);
        setMsgUploading(false);
        setMsgUploadProgress(0);
        setMsgUploadedUrl(null);
        setMsgFileError(null);
    };

    const registeredUsers = Array.from(new Set([
        ...(userEmail ? [userEmail] : []),
        "bintangwcproger@gmail.com",
        "andi@kanvexa.com",
        "budi@kanvexa.com",
        "siti@kanvexa.com"
    ]));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (msgFileError || msgUploading) return;
        setSaving(true);

        try {
            if (isMessageBoard) {
                let fileUrl: string | null = msgUploadedUrl;
                let fileName: string | null = msgFile ? msgFile.name : null;
                let fileSize: number | null = msgFile ? msgFile.size : null;

                await createPost(
                    boardId,
                    msgTitle.trim() || "Pengumuman Tim",
                    msgContent.trim() || "Diskusi awal",
                    msgCategory,
                    msgIsPinned,
                    fileUrl,
                    fileName,
                    fileSize
                );
            } else if (isDocsFiles) {
                const colName = "Docs & Files";
                const cardTaskName = docTitle.trim() || "Dokumen Proyek Utama";
                await createColumnWithCard(
                    boardId,
                    colName,
                    cardTaskName,
                    {
                        notes: `[Kategori: ${docCategory}]\n\n${docContent}`,
                    }
                );
            } else if (presetType.includes("To-Do List") || presetType.includes("Kanban")) {
                const cardTaskName = presetSubTitle.trim() || "Tugas Pertama";
                await createKanbanWorkflow(
                    boardId,
                    cardTaskName,
                    {
                        dueDate: presetDueDate,
                        dueTime: presetDueTime,
                        assignee: presetAssignee.trim(),
                        notes: presetNotes.trim(),
                    }
                );
            } else {
                const colName = presetColTitle.trim() || defaultColTitle;
                const cardTaskName = presetSubTitle.trim() || (isCalendar ? "Tenggat Pekerjaan Utama" : "Tugas Pertama");
                await createColumnWithCard(
                    boardId,
                    colName,
                    cardTaskName,
                    {
                        dueDate: presetDueDate || (isCalendar ? todayIso : undefined),
                        dueTime: presetDueTime,
                        assignee: presetAssignee.trim(),
                        notes: presetNotes.trim(),
                    }
                );
            }
            onClose();
        } catch (err: any) {
            alert("Gagal membuat preset: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
        }}>
            <div style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderTop: `4px solid ${theme.main}`,
                borderRadius: 20,
                width: "100%",
                maxWidth: 520,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                overflow: "hidden",
                animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        {isDocsFiles
                            ? "Konfigurasi Docs & Files Hub"
                            : isCalendar
                            ? "Konfigurasi Jadwal & Kalender Tugas"
                            : isMessageBoard
                            ? "Konfigurasi Message Board"
                            : `Konfigurasi Kolom (${presetType})`}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#94a3b8", fontSize: 22, padding: 0, lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "68vh", overflowY: "auto" }}>
                        
                        {isDocsFiles ? (
                            /* CUSTOM DOCS & FILES FORM FIELDS */
                            <>
                                {/* 1. Judul Dokumen Awal */}
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        Judul Dokumen Awal
                                    </label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 12px" }}>
                                        <FileText style={{ width: 16, height: 16, color: theme.main, flexShrink: 0 }} />
                                        <input
                                            required
                                            autoFocus
                                            value={docTitle}
                                            onChange={(e) => setDocTitle(e.target.value)}
                                            placeholder="misal: PRD Fitur Utama / Spesifikasi API"
                                            style={{
                                                flex: 1, border: "none", outline: "none", fontSize: 14,
                                                background: "transparent", color: "#0f172a",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 2. Kategori Dokumen */}
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        Kategori Dokumen
                                    </label>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {[
                                            { cat: "PRD", label: "PRD", color: "#6d28d9", bg: "rgba(109, 40, 217, 0.1)" },
                                            { cat: "Meeting Notes", label: "Catatan Rapat", color: "#2563eb", bg: "rgba(37, 99, 235, 0.1)" },
                                            { cat: "Briefing", label: "Briefing Tim", color: "#d97706", bg: "rgba(217, 119, 6, 0.1)" },
                                            { cat: "Technical Spec", label: "Spesifikasi Teknis", color: "#059669", bg: "rgba(16, 185, 129, 0.1)" },
                                            { cat: "General", label: "Umum", color: "#475569", bg: "rgba(100, 116, 139, 0.1)" },
                                        ].map((item) => {
                                            const isSelected = docCategory === item.cat;
                                            return (
                                                <button
                                                    key={item.cat}
                                                    type="button"
                                                    onClick={() => setDocCategory(item.cat as DocCategory)}
                                                    style={{
                                                        padding: "6px 12px",
                                                        borderRadius: 8,
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        border: isSelected ? `2px solid ${item.color}` : "1px solid #cbd5e1",
                                                        background: isSelected ? item.bg : "#ffffff",
                                                        color: isSelected ? item.color : "#64748b",
                                                        cursor: "pointer",
                                                        transition: "all 0.15s ease",
                                                    }}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 3. Isi Dokumen Awal (Markdown) */}
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        Isi Dokumen Awal (Format Markdown)
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={docContent}
                                        onChange={(e) => setDocContent(e.target.value)}
                                        placeholder="Tuliskan spesifikasi, deskripsi, atau catatan proyek di sini..."
                                        style={{
                                            width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                                            border: "1px solid #cbd5e1", outline: "none",
                                            background: "#f8fafc", color: "#0f172a", resize: "vertical",
                                            fontFamily: "monospace", lineHeight: 1.5, boxSizing: "border-box",
                                        }}
                                    />
                                </div>

                                {/* 4. Lampiran Berkas (Max 50 MB) */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569" }}>
                                            <Paperclip width={14} height={14} style={{ color: "#6d28d9" }} />
                                            <span>Lampiran Berkas (Opsional)</span>
                                        </label>
                                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Maksimal 50 MB</span>
                                    </div>

                                    {msgFile ? (
                                        <div style={{
                                            display: "flex", flexDirection: "column", gap: 8,
                                            padding: "12px 14px", borderRadius: 10, background: "#f8fafc",
                                            border: "1px solid #cbd5e1", fontSize: 13,
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                                                    <FileText width={18} height={18} style={{ color: "#6d28d9", flexShrink: 0 }} />
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                                            {msgFile.name}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#64748b" }}>
                                                            {formatFileSize(msgFile.size)} {msgUploading && `• Mengunggah...`} {!msgUploading && msgUploadedUrl && `• Selesai`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelMsgFile}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
                                                >
                                                    <X width={16} height={16} />
                                                </button>
                                            </div>

                                            {msgUploading && (
                                                <div style={{ width: "100%", marginTop: 4 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 500 }}>
                                                        <span>Progress Mengunggah</span>
                                                        <span>{msgUploadProgress}%</span>
                                                    </div>
                                                    <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                                                        <div style={{
                                                            width: `${msgUploadProgress}%`,
                                                            height: "100%",
                                                            background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)",
                                                            borderRadius: 3,
                                                            transition: "width 0.15s ease-out-in"
                                                        }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label style={{
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                            padding: "12px 16px", borderRadius: 10, border: "2px dashed #cbd5e1",
                                            background: "#f8fafc", cursor: "pointer", fontSize: 13, color: "#64748b",
                                            fontWeight: 500, transition: "all 0.15s ease",
                                        }}>
                                            <Upload width={16} height={16} style={{ color: "#6d28d9" }} />
                                            <span>Pilih File Lampiran (PDF, Doc, Zip max 50MB)</span>
                                            <input
                                                type="file"
                                                onChange={handleMsgFileChange}
                                                disabled={saving || msgUploading}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    )}

                                    {msgFileError && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626", marginTop: 6, fontWeight: 600 }}>
                                            <AlertCircle width={14} height={14} />
                                            <span>{msgFileError}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : isMessageBoard ? (
                            /* CUSTOM MESSAGE BOARD FORM FIELDS */
                            <>
                                {/* 1. Judul Topik / Pengumuman */}
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        Judul Topik / Pengumuman Awal
                                    </label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 12px" }}>
                                        <MessageSquare style={{ width: 16, height: 16, color: theme.main, flexShrink: 0 }} />
                                        <input
                                            required
                                            autoFocus
                                            value={msgTitle}
                                            onChange={(e) => setMsgTitle(e.target.value)}
                                            placeholder="misal: Rencana Peluncuran / Diskusi Tim"
                                            style={{
                                                flex: 1, border: "none", outline: "none", fontSize: 14,
                                                background: "transparent", color: "#0f172a",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 2. Kategori Postingan */}
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        Kategori Postingan
                                    </label>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {(["announcement", "idea", "discussion", "qa"] as PostCategory[]).map((cat) => {
                                            const b = getCategoryBadge(cat);
                                            const isSelected = msgCategory === cat;
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setMsgCategory(cat)}
                                                    style={{
                                                        padding: "6px 12px",
                                                        borderRadius: 8,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        border: isSelected ? `2px solid ${b.color}` : "1px solid #cbd5e1",
                                                        background: isSelected ? b.bg : "#ffffff",
                                                        color: isSelected ? b.color : "#64748b",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        transition: "all 0.15s ease",
                                                    }}
                                                >
                                                    {(() => {
                                                        const CategoryIcon = b.icon;
                                                        return <CategoryIcon width={13} height={13} />;
                                                    })()}
                                                    <span>{b.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 3. Isi Pesan / Diskusi Awal */}
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        Isi Pesan / Diskusi Awal
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={msgContent}
                                        onChange={(e) => setMsgContent(e.target.value)}
                                        placeholder="Tuliskan detail pesan, ide, atau pengumuman awal di sini..."
                                        style={{
                                            width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                                            border: "1px solid #cbd5e1", outline: "none",
                                            background: "#f8fafc", color: "#0f172a", resize: "vertical",
                                            fontFamily: "inherit", boxSizing: "border-box",
                                        }}
                                    />
                                </div>

                                {/* 4. Lampiran File (Max 50MB) */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569" }}>
                                            <Paperclip width={14} height={14} style={{ color: "#7c3aed" }} />
                                            <span>Lampiran File</span>
                                        </label>
                                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Maksimal 50 MB</span>
                                    </div>

                                    {msgFile ? (
                                        <div style={{
                                            display: "flex", flexDirection: "column", gap: 8,
                                            padding: "12px 14px", borderRadius: 10, background: "#f8fafc",
                                            border: "1px solid #cbd5e1", fontSize: 13,
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                                                    <FileText width={18} height={18} style={{ color: "#6d28d9", flexShrink: 0 }} />
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                                            {msgFile.name}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#64748b" }}>
                                                            {formatFileSize(msgFile.size)} {msgUploading && `• Mengunggah...`} {!msgUploading && msgUploadedUrl && `• Selesai`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelMsgFile}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
                                                >
                                                    <X width={16} height={16} />
                                                </button>
                                            </div>

                                            {msgUploading && (
                                                <div style={{ width: "100%", marginTop: 4 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 500 }}>
                                                        <span>Progress Mengunggah</span>
                                                        <span>{msgUploadProgress}%</span>
                                                    </div>
                                                    <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                                                        <div style={{
                                                            width: `${msgUploadProgress}%`,
                                                            height: "100%",
                                                            background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)",
                                                            borderRadius: 3,
                                                            transition: "width 0.15s ease-out-in"
                                                        }} />
                                                     </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label style={{
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                            padding: "12px 16px", borderRadius: 10, border: "2px dashed #cbd5e1",
                                            background: "#f8fafc", cursor: "pointer", fontSize: 13, color: "#64748b",
                                            fontWeight: 500, transition: "all 0.15s ease",
                                        }}>
                                            <Upload width={16} height={16} style={{ color: "#7c3aed" }} />
                                            <span>Pilih File untuk Diunggah (Max 50MB)</span>
                                            <input
                                                type="file"
                                                onChange={handleMsgFileChange}
                                                disabled={saving || msgUploading}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    )}

                                    {msgFileError && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626", marginTop: 6, fontWeight: 600 }}>
                                            <AlertCircle width={14} height={14} />
                                            <span>{msgFileError}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Pin option */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        id="presetMsgPinned"
                                        checked={msgIsPinned}
                                        onChange={(e) => setMsgIsPinned(e.target.checked)}
                                        style={{ cursor: "pointer", width: 16, height: 16 }}
                                    />
                                    <label
                                        htmlFor="presetMsgPinned"
                                        style={{ fontSize: 13, color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                    >
                                        <Pin width={13} height={13} style={{ color: "#7c3aed" }} />
                                        <span>Sematkan postingan ini di bagian atas (Pinned Post)</span>
                                    </label>
                                </div>
                            </>
                        ) : (
                            /* STANDARD CHECKLIST / TODOLIST / CALENDAR FORM FIELDS */
                            <>
                                {/* 1. Item Tugas / Kartu Pertama */}
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        {isCalendar ? "Nama Tugas / Event Kalender" : "Nama Tugas / Item Checklist"}
                                    </label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 12px" }}>
                                        {isCalendar ? (
                                            <Calendar style={{ width: 16, height: 16, color: theme.main, flexShrink: 0 }} />
                                        ) : (
                                            <div style={{
                                                width: 18, height: 18, borderRadius: 4, border: `2px solid ${theme.main}`,
                                                display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, flexShrink: 0
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.main} strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                        )}
                                        <input
                                            required
                                            autoFocus
                                            value={presetSubTitle}
                                            onChange={(e) => setPresetSubTitle(e.target.value)}
                                            placeholder={isCalendar ? "misal: Perencanaan Sprint / Peluncuran Proyek" : "misal: Ayo gym, Kerjakan tugas, dll..."}
                                            style={{
                                                flex: 1, border: "none", outline: "none", fontSize: 14,
                                                background: "transparent", color: "#0f172a",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 2. Tanggal & Jam Tenggat */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                            <Calendar style={{ width: 13, height: 13, color: "#4f46e5" }} />
                                            <span>Tanggal Selesai {isCalendar ? "(Tenggat Kalender)" : ""}</span>
                                        </label>
                                        <input
                                            type="date"
                                            required={isCalendar}
                                            value={presetDueDate}
                                            onChange={(e) => setPresetDueDate(e.target.value)}
                                            style={{
                                                width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                                                border: isCalendar ? "1.5px solid #7c3aed" : "1px solid #cbd5e1", outline: "none",
                                                background: isCalendar ? "#f5f3ff" : "#f8fafc", color: "#0f172a", fontWeight: 600,
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                            <Clock style={{ width: 13, height: 13, color: "#d97706" }} />
                                            <span>Jam</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={presetDueTime}
                                            onChange={(e) => setPresetDueTime(e.target.value)}
                                            style={{
                                                width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                                                border: "1px solid #cbd5e1", outline: "none",
                                                background: "#f8fafc", color: "#0f172a",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 3. Ditugaskan Kepada */}
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        <User style={{ width: 13, height: 13, color: "#059669" }} />
                                        <span>Ditugaskan Kepada (User Terdaftar)</span>
                                    </label>
                                    <select
                                        value={presetAssignee}
                                        onChange={(e) => setPresetAssignee(e.target.value)}
                                        style={{
                                            width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                                            border: "1px solid #cbd5e1", outline: "none",
                                            background: "#f8fafc", color: "#0f172a", cursor: "pointer", fontWeight: 500
                                        }}
                                    >
                                        <option value="">-- Pilih User Terdaftar --</option>
                                        {registeredUsers.map((uEmail) => {
                                            const namePart = uEmail.split("@")[0];
                                            const isMe = userEmail && uEmail.toLowerCase() === userEmail.toLowerCase();
                                            return (
                                                <option key={uEmail} value={namePart}>
                                                    👤 {namePart} ({uEmail}){isMe ? " - Saya" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* 4. Catatan */}
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        <FileText style={{ width: 13, height: 13, color: "#64748b" }} />
                                        <span>{isCalendar ? "Catatan Jadwal / Instruksi Kalender" : "Catatan / Instructions"}</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={presetNotes}
                                        onChange={(e) => setPresetNotes(e.target.value)}
                                        placeholder="Tulis catatan tambahan, referensi, atau instruksi..."
                                        style={{
                                            width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                                            border: "1px solid #cbd5e1", outline: "none",
                                            background: "#f8fafc", color: "#0f172a", resize: "vertical",
                                            fontFamily: "inherit"
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div style={{
                        padding: "16px 24px 20px",
                        background: "#f8fafc",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving || msgUploading}
                            style={{
                                padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                background: "none", border: "1px solid #cbd5e1",
                                color: "#475569", cursor: (saving || msgUploading) ? "not-allowed" : "pointer"
                            }}
                        >
                            Batalkan
                        </button>
                        <button
                            type="submit"
                            disabled={saving || msgUploading}
                            style={{
                                padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: theme.main, color: "#fff", border: "none",
                                cursor: (saving || msgUploading) ? "not-allowed" : "pointer",
                                opacity: (saving || msgUploading) ? 0.6 : 1,
                                boxShadow: `0 4px 14px ${theme.shadow}`,
                                display: "flex", alignItems: "center", gap: 6,
                            }}
                        >
                            {saving ? "Membuat..." : msgUploading ? "Mengunggah..." : isDocsFiles ? "Buat Dokumen Ini" : isCalendar ? "Buat Jadwal Kalender" : isMessageBoard ? "Buat Postingan" : "Buat Papan Ini"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
