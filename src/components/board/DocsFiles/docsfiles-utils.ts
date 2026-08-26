import { FileText, Calendar, CheckSquare, Sparkles, BookOpen, Layers, type LucideIcon } from "lucide-react";

export type DocCategory = "PRD" | "Meeting Notes" | "Briefing" | "Technical Spec" | "General";

export interface DocFolderItem {
  id: string;
  name: string;
  fileCount: number;
  subfolders?: DocFolderItem[];
}

export interface DocFileItem {
  id: string;
  board_id: string;
  folder_id?: string;
  title: string;
  category: DocCategory;
  content_markdown: string;
  summary_highlights?: string[];
  action_items?: string[];
  author_email: string;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  created_at: string;
  updated_at: string;
}

export const INITIAL_SAMPLE_FOLDERS: DocFolderItem[] = [];

export interface AIDocResponse {
  action: "generate_doc" | "summarize_doc" | "improve_doc";
  data: {
    title: string;
    category: DocCategory;
    content_markdown: string;
    summary_highlights?: string[];
    action_items?: string[];
  };
}

export function getDocCategoryBadge(category: DocCategory): {
  label: string;
  icon: LucideIcon;
  bg: string;
  color: string;
  border: string;
} {
  switch (category) {
    case "PRD":
      return { label: "PRD", icon: BookOpen, bg: "rgba(109, 40, 217, 0.12)", color: "#6d28d9", border: "rgba(109, 40, 217, 0.25)" };
    case "Meeting Notes":
      return { label: "Catatan Rapat", icon: Calendar, bg: "rgba(37, 99, 235, 0.12)", color: "#2563eb", border: "rgba(37, 99, 235, 0.25)" };
    case "Briefing":
      return { label: "Briefing Tim", icon: Sparkles, bg: "rgba(217, 119, 6, 0.12)", color: "#d97706", border: "rgba(217, 119, 6, 0.25)" };
    case "Technical Spec":
      return { label: "Spesifikasi Teknis", icon: Layers, bg: "rgba(16, 185, 129, 0.12)", color: "#059669", border: "rgba(16, 185, 129, 0.25)" };
    case "General":
    default:
      return { label: "Umum", icon: FileText, bg: "rgba(100, 116, 139, 0.12)", color: "#475569", border: "rgba(100, 116, 139, 0.25)" };
  }
}

export const INITIAL_SAMPLE_DOCS: DocFileItem[] = [];
