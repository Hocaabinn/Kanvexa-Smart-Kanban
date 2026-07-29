import { Megaphone, Lightbulb, MessageSquare, HelpCircle, type LucideIcon } from "lucide-react";

export type PostCategory = "announcement" | "idea" | "discussion" | "qa";

export interface BoardPost {
  id: string;
  board_id: string;
  author_id: string;
  author_email: string;
  title: string;
  content: string;
  category: PostCategory;
  is_pinned: boolean;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  created_at: string;
  updated_at: string;
}

export interface BoardPostComment {
  id: string;
  post_id: string;
  board_id: string;
  author_id: string;
  author_email: string;
  content: string;
  created_at: string;
}

export function getCategoryBadge(category: PostCategory): {
  label: string;
  icon: LucideIcon;
  bg: string;
  color: string;
  border: string;
} {
  switch (category) {
    case "announcement":
      return { label: "Pengumuman", icon: Megaphone, bg: "rgba(225, 29, 72, 0.12)", color: "#e11d48", border: "rgba(225, 29, 72, 0.25)" };
    case "idea":
      return { label: "Ide Proyek", icon: Lightbulb, bg: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "rgba(16, 185, 129, 0.25)" };
    case "qa":
      return { label: "Tanya Jawab", icon: HelpCircle, bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.25)" };
    case "discussion":
    default:
      return { label: "Diskusi", icon: MessageSquare, bg: "rgba(109, 40, 217, 0.12)", color: "#6d28d9", border: "rgba(109, 40, 217, 0.25)" };
  }
}

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}j lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}hr lalu`;

  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function getAuthorInitials(email: string): string {
  if (!email) return "A";
  const namePart = email.split("@")[0];
  return namePart.slice(0, 2).toUpperCase();
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

