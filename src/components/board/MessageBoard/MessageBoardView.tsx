"use client";

import { useState } from "react";
import { Plus, Sparkles, Search, MessageSquare, ListTodo, Pin, Users, Paperclip, ArrowUpRight, TrendingUp, Share2 } from "lucide-react";
import { BoardPost, BoardPostComment, PostCategory, getCategoryBadge, formatTimeAgo, getAuthorInitials } from "./messageboard-utils";
import MessagePostCard from "./MessagePostCard";
import CreatePostModal from "./CreatePostModal";
import AIMessageSummaryModal from "./AIMessageSummaryModal";
import AIDiscussionToTasksModal from "./AIDiscussionToTasksModal";
import ShareBoardModal from "./ShareBoardModal";

interface Props {
  boardId: string;
  userEmail: string;
  posts: BoardPost[];
  comments: BoardPostComment[];
  columns: { id: string; name: string }[];
  canEdit: boolean;
  onTasksCreated: () => void;
}

export default function MessageBoardView({
  boardId,
  userEmail,
  posts,
  comments,
  columns,
  canEdit,
  onTasksCreated,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Separate Pinned and Regular posts for sidebar & main feed
  const pinnedPosts = posts.filter((p) => p.is_pinned);

  // Calculate Top Contributors
  const contributorMap: Record<string, { email: string; postCount: number; commentCount: number }> = {};

  // Always ensure current logged-in user is in the list
  if (userEmail) {
    const cleanEmail = userEmail.toLowerCase().trim();
    contributorMap[cleanEmail] = { email: cleanEmail, postCount: 0, commentCount: 0 };
  }

  // Always ensure the owner/sender is in the list
  const ownerEmail = "bintangwcproger@gmail.com";
  contributorMap[ownerEmail] = { email: ownerEmail, postCount: 0, commentCount: 0 };

  posts.forEach((p) => {
    const email = (p.author_email || "Anonim").toLowerCase().trim();
    if (!contributorMap[email]) {
      contributorMap[email] = { email, postCount: 0, commentCount: 0 };
    }
    contributorMap[email].postCount += 1;
  });

  comments.forEach((c) => {
    const email = (c.author_email || "Anonim").toLowerCase().trim();
    if (!contributorMap[email]) {
      contributorMap[email] = { email, postCount: 0, commentCount: 0 };
    }
    contributorMap[email].commentCount += 1;
  });

  const topContributors = Object.values(contributorMap)
    .sort((a, b) => b.postCount + b.commentCount - (a.postCount + a.commentCount))
    .slice(0, 4);

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1240, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* Header Bar Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "rgba(109, 40, 217, 0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#6d28d9"
            }}>
              <MessageSquare width={20} height={20} />
            </div>
            <span>Message Board & Diskusi</span>
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Wadah diskusi ide, pengumuman tim, dan penyusunan tugas otomatis dengan AI.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowSummaryModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(109, 40, 217, 0.08)",
              color: "#6d28d9",
              border: "1px solid rgba(109, 40, 217, 0.2)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span>✦ Urai dengan AI</span>
          </button>

          <button
            onClick={() => setShowTasksModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.08)",
              color: "#059669",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <ListTodo width={15} height={15} />
            <span>Diskusi → Tugas AI</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(37, 99, 235, 0.08)",
              color: "#2563eb",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Share2 width={15} height={15} />
            <span>Bagikan</span>
          </button>

          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: "var(--v)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(109, 40, 217, 0.3)",
                transition: "all 0.15s ease",
              }}
            >
              <Plus width={16} height={16} />
              <span>Buat Postingan</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
          background: "#ffffff",
          padding: "12px 16px",
          borderRadius: 14,
          border: "1px solid var(--border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        {/* Category Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: selectedCategory === "all" ? "1.5px solid #6d28d9" : "1px solid transparent",
              background: selectedCategory === "all" ? "rgba(109, 40, 217, 0.1)" : "#f8fafc",
              color: selectedCategory === "all" ? "#6d28d9" : "#64748b",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Semua ({posts.length})
          </button>

          {(["announcement", "idea", "discussion", "qa"] as PostCategory[]).map((cat) => {
            const b = getCategoryBadge(cat);
            const isSelected = selectedCategory === cat;
            const count = posts.filter((p) => p.category === cat).length;
            const CategoryIcon = b.icon;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: isSelected ? `1.5px solid ${b.color}` : "1px solid transparent",
                  background: isSelected ? b.bg : "#f8fafc",
                  color: isSelected ? b.color : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <CategoryIcon width={13} height={13} />
                <span>{b.label}</span>
                <span style={{ fontSize: 11, opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: 220, flexShrink: 0 }}>
          <Search
            width={15}
            height={15}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Cari postingan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 14px 7px 34px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 13,
              outline: "none",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Split-Screen 2 Column Layout (70% Feed Utama : 30% Sidebar Kanan) */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* SISI KIRI: Feed Utama (Compact Cards) */}
        <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredPosts.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: "48px 24px",
                textAlign: "center",
                border: "1px dashed var(--border)",
              }}
            >
              <MessageSquare width={36} height={36} style={{ color: "#cbd5e1", marginBottom: 12 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>
                Belum ada postingan diskusi
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                {searchQuery
                  ? "Tidak ada postingan yang sesuai dengan pencarian."
                  : "Mulai percakapan dengan menekan tombol 'Buat Postingan'."}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <MessagePostCard
                key={post.id}
                boardId={boardId}
                post={post}
                comments={comments.filter((c) => c.post_id === post.id)}
                canEdit={canEdit}
                userEmail={userEmail}
              />
            ))
          )}
        </div>

        {/* SISI KANAN: Sidebar Widget Pintar Kanvexa (30% Width ~ 340px) */}
        <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Widget 1: ✨ AI Insights / Rangkuman Cepat */}
          <div
            style={{
              background: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
              borderRadius: 16,
              padding: "18px 20px",
              color: "#ffffff",
              boxShadow: "0 10px 25px rgba(109, 40, 217, 0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: -20, right: -20, width: 90, height: 90,
              background: "rgba(255, 255, 255, 0.1)", borderRadius: "50%", pointerEvents: "none"
            }} />
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, letterSpacing: "0.02em" }}>
                <Sparkles width={16} height={16} style={{ color: "#fef08a" }} />
                <span>AI Insights & Ringkasan</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "rgba(255, 255, 255, 0.2)", color: "#fff" }}>
                Kanvexa AI
              </span>
            </div>

            <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.9, margin: "0 0 14px 0" }}>
              {posts.length > 0
                ? `Terdapat ${posts.length} postingan dan ${comments.length} balasan aktif. Dapatkan ringkasan poin penting secara instan.`
                : "Belum ada diskusi untuk dirangkum. Buat postingan pertama Anda untuk menguji kecerdasan AI."}
            </p>

            <button
              onClick={() => setShowSummaryModal(true)}
              style={{
                width: "100%",
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: "#ffffff",
                color: "#6d28d9",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "transform 0.15s ease",
              }}
            >
              <span>✦ Urai dengan AI</span>
              <ArrowUpRight width={14} height={14} />
            </button>
          </div>

          {/* Widget 2: 📌 Pinned Announcements (Pengumuman Disematkan Mini List) */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: "18px 20px",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                <Pin width={15} height={15} style={{ color: "#7c3aed" }} />
                <span>Pengumuman Disematkan</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" }}>
                {pinnedPosts.length} Pinned
              </span>
            </div>

            {pinnedPosts.length === 0 ? (
              <div style={{ padding: "16px 12px", textAlign: "center", background: "#f8fafc", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                  Belum ada pengumuman disematkan. Klik ikon jarum pin pada postingan untuk menyematkan ke sini.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pinnedPosts.map((p) => {
                  const b = getCategoryBadge(p.category);
                  const CategoryIcon = b.icon;
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: b.bg, color: b.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <CategoryIcon width={10} height={10} />
                          {b.label}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>• {formatTimeAgo(p.created_at)}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 4 }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {p.content}
                      </div>
                      {p.file_name && (
                        <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#6d28d9", background: "rgba(109, 40, 217, 0.08)", padding: "2px 6px", borderRadius: 4 }}>
                          <Paperclip width={10} height={10} />
                          <span>{p.file_name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Widget 3: 👥 Anggota Aktif / Top Contributor */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: "18px 20px",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                <Users width={15} height={15} style={{ color: "#059669" }} />
                <span>Anggota Aktif</span>
              </div>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                {topContributors.length} Orang
              </span>
            </div>

            {topContributors.length === 0 ? (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, textAlign: "center" }}>
                Belum ada anggota beraktivitas.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topContributors.map((user, idx) => {
                  const name = user.email.split("@")[0];
                  const initials = getAuthorInitials(user.email);
                  const isMe = user.email.toLowerCase() === userEmail.toLowerCase();
                  return (
                    <div
                      key={user.email}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: isMe ? "rgba(109, 40, 217, 0.05)" : "#f8fafc",
                        border: isMe ? "1px solid rgba(109, 40, 217, 0.2)" : "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: idx === 0 ? "#7c3aed" : idx === 1 ? "#2563eb" : "#059669",
                            color: "#ffffff",
                            fontSize: 10,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 4 }}>
                            <span>{name}</span>
                            {isMe && <span style={{ fontSize: 10, color: "#6d28d9", fontWeight: 800 }}>(Saya)</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {user.postCount} post • {user.commentCount} balasan
                          </div>
                        </div>
                      </div>

                      {idx === 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: "rgba(245, 158, 11, 0.15)", color: "#d97706" }}>
                          Top #1
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modals */}
      {showCreateModal && <CreatePostModal boardId={boardId} onClose={() => setShowCreateModal(false)} />}
      {showSummaryModal && (
        <AIMessageSummaryModal posts={posts} comments={comments} onClose={() => setShowSummaryModal(false)} />
      )}
      {showShareModal && (
        <ShareBoardModal boardId={boardId} userEmail={userEmail} onClose={() => setShowShareModal(false)} />
      )}
      {showTasksModal && (
        <AIDiscussionToTasksModal
          boardId={boardId}
          posts={posts}
          comments={comments}
          columns={columns}
          onClose={() => setShowTasksModal(false)}
          onDone={() => {
            setShowTasksModal(false);
            onTasksCreated();
          }}
        />
      )}
    </div>
  );
}
