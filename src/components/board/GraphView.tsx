"use client";

import { useEffect, useRef, useState } from "react";
import { GitBranch, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import CardDetailsModal from "./CardDetailsModal";

interface Card {
  id: string;
  column_id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  name: string;
  accent_color?: string;
}

interface Props {
  boardId: string;
  columns: Column[];
  cards: Card[];
  canEdit: boolean;
}

interface Node {
  id: string;
  label: string;
  type: "column" | "card";
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  cardId?: string; // only for card type
}

interface Link {
  source: string;
  target: string;
}

export default function GraphView({ boardId, columns, cards, canEdit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse nodes and links
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const isDraggingRef = useRef<Node | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const transformRef = useRef({ zoom: 1, pan: { x: 0, y: 0 } });

  // Update refs when zoom/pan changes
  useEffect(() => {
    transformRef.current = { zoom, pan };
  }, [zoom, pan]);

  // Initial Node Placement & Link Generation
  useEffect(() => {
    const newNodes: Node[] = [];
    const newLinks: Link[] = [];

    // 1. Add Column nodes
    columns.forEach((col, idx) => {
      const angle = (idx / columns.length) * Math.PI * 2;
      const radius = 220;
      newNodes.push({
        id: `col-${col.id}`,
        label: col.name,
        type: "column",
        color: col.accent_color || "#6366f1",
        x: Math.cos(angle) * radius + 400,
        y: Math.sin(angle) * radius + 300,
        vx: 0,
        vy: 0,
        radius: 18,
      });
    });

    // 2. Add Card nodes
    cards.forEach((card, idx) => {
      // Find parent column
      const colNode = newNodes.find(n => n.id === `col-${card.column_id}`);
      const colColor = colNode?.color || "#cbd5e1";

      const offsetAngle = Math.random() * Math.PI * 2;
      const offsetDist = 50 + Math.random() * 80;
      
      const parentX = colNode ? colNode.x : 400;
      const parentY = colNode ? colNode.y : 300;

      newNodes.push({
        id: `card-${card.id}`,
        label: card.title,
        type: "card",
        color: colColor,
        x: parentX + Math.cos(offsetAngle) * offsetDist,
        y: parentY + Math.sin(offsetAngle) * offsetDist,
        vx: 0,
        vy: 0,
        radius: 8,
        cardId: card.id,
      });

      // Link card to its column
      newLinks.push({
        source: `card-${card.id}`,
        target: `col-${card.column_id}`,
      });

      // Parse Obsidian wiki links [[Title]] in card description
      if (card.description) {
        const wikiLinkRegex = /\[\[(.*?)\]\]/g;
        let match;
        while ((match = wikiLinkRegex.exec(card.description)) !== null) {
          const targetTitle = match[1].trim().toLowerCase();
          // Find target card with matching title (case-insensitive)
          const targetCard = cards.find(c => c.title.trim().toLowerCase() === targetTitle && c.id !== card.id);
          if (targetCard) {
            newLinks.push({
              source: `card-${card.id}`,
              target: `card-${targetCard.id}`,
            });
          }
        }
      }
    });

    nodesRef.current = newNodes;
    linksRef.current = newLinks;
  }, [columns, cards]);

  // High-DPI (Retina) Canvas Resolution Handling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Adjust canvas backing store size
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFullscreen]);

  // Physics Simulation Loop
  useEffect(() => {
    let animationFrameId: number;

    const runPhysics = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;

      const chargeForce = -220; // repulsion between nodes
      const gravityForce = 0.015; // pull to center
      const linkStrength = 0.085; // spring strength
      const targetDistances = { column: 130, card: 75 }; // target link lengths

      // Dynamically calculate center coordinates based on container size
      const container = containerRef.current;
      const width = container ? container.getBoundingClientRect().width : 800;
      const height = container ? container.getBoundingClientRect().height : 600;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Force: Repulsion (Charge) between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < 400) {
            const force = chargeForce / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (isDraggingRef.current?.id !== n1.id) {
              n1.vx += fx;
              n1.vy += fy;
            }
            if (isDraggingRef.current?.id !== n2.id) {
              n2.vx -= fx;
              n2.vy -= fy;
            }
          }
        }
      }

      // 2. Force: Links (Springs)
      links.forEach(link => {
        const sNode = nodes.find(n => n.id === link.source);
        const tNode = nodes.find(n => n.id === link.target);

        if (sNode && tNode) {
          const dx = tNode.x - sNode.x;
          const dy = tNode.y - sNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Target distance based on connection type
          const target = (sNode.type === "column" && tNode.type === "column") 
            ? 250 
            : (sNode.type === "card" && tNode.type === "card") 
              ? targetDistances.card 
              : targetDistances.column;

          const diff = dist - target;
          const force = diff * linkStrength;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (isDraggingRef.current?.id !== sNode.id) {
            sNode.vx += fx;
            sNode.vy += fy;
          }
          if (isDraggingRef.current?.id !== tNode.id) {
            tNode.vx -= fx;
            tNode.vy -= fy;
          }
        }
      });

      // 3. Force: Gravity towards center
      nodes.forEach(node => {
        if (isDraggingRef.current?.id !== node.id) {
          node.vx += (centerX - node.x) * gravityForce;
          node.vy += (centerY - node.y) * gravityForce;

          // Apply velocity and damping
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.72; // damping factor
          node.vy *= 0.72;
        }
      });

      // 4. Render Canvas
      renderCanvas();

      animationFrameId = requestAnimationFrame(runPhysics);
    };

    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const currentZoom = transformRef.current.zoom;
      const currentPan = transformRef.current.pan;

      // Clear canvas using full backing store dimensions
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save state and apply High-DPI scaling followed by zoom/pan transforms
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(currentPan.x, currentPan.y);
      ctx.scale(currentZoom, currentZoom);

      // Draw Grid background (Obsidian style)
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      const startX = -currentPan.x / currentZoom;
      const startY = -currentPan.y / currentZoom;
      const endX = startX + (canvas.width / dpr) / currentZoom;
      const endY = startY + (canvas.height / dpr) / currentZoom;

      for (let x = Math.floor(startX / gridSpacing) * gridSpacing; x < endX; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = Math.floor(startY / gridSpacing) * gridSpacing; y < endY; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // Draw links
      links.forEach(link => {
        const sNode = nodes.find(n => n.id === link.source);
        const tNode = nodes.find(n => n.id === link.target);

        if (sNode && tNode) {
          ctx.beginPath();
          ctx.moveTo(sNode.x, sNode.y);
          ctx.lineTo(tNode.x, tNode.y);
          
          // Style: card-to-card link is dashed/purple, column-to-card is solid/gray
          if (sNode.type === "card" && tNode.type === "card") {
            ctx.strokeStyle = "rgba(109, 40, 217, 0.4)";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([4, 4]);
          } else {
            ctx.strokeStyle = "rgba(203, 213, 225, 0.55)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([]);
          }
          ctx.stroke();
        }
      });
      ctx.setLineDash([]); // Reset line dash

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

        if (node.type === "column") {
          // Column nodes (Large hubs)
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Outer glowing ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = `${node.color}22`;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Card nodes (Standard Obsidian dots)
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw text labels
        ctx.fillStyle = node.type === "column" ? "#0f172a" : "#475569";
        ctx.font = node.type === "column" ? "bold 11px sans-serif" : "9px sans-serif";
        ctx.textAlign = "center";
        
        // Text offset
        const yOffset = node.type === "column" ? node.radius + 16 : node.radius + 12;
        
        // Label wrapping or truncating
        let label = node.label;
        if (node.type === "card" && label.length > 15) {
          label = label.substring(0, 12) + "...";
        }
        ctx.fillText(label, node.x, node.y + yOffset);
      });

      ctx.restore();
    };

    runPhysics();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Event Handlers for Dragging & Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert screen coordinates to canvas world coordinates
    const worldX = (clientX - transformRef.current.pan.x) / transformRef.current.zoom;
    const worldY = (clientY - transformRef.current.pan.y) / transformRef.current.zoom;

    // Check if clicked a node
    const clickedNode = nodesRef.current.find(node => {
      const dx = node.x - worldX;
      const dy = node.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 10; // margin of error
    });

    if (clickedNode) {
      if (clickedNode.type === "card" && e.detail === 2) {
        // Double click card to open modal
        const cardObj = cards.find(c => c.id === clickedNode.cardId);
        if (cardObj) setSelectedCard(cardObj);
      } else {
        isDraggingRef.current = clickedNode;
        dragOffsetRef.current = {
          x: clickedNode.x - worldX,
          y: clickedNode.y - worldY,
        };
      }
    } else {
      // Start panning
      isDraggingRef.current = null;
      dragOffsetRef.current = {
        x: clientX - transformRef.current.pan.x,
        y: clientY - transformRef.current.pan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const worldX = (clientX - transformRef.current.pan.x) / transformRef.current.zoom;
    const worldY = (clientY - transformRef.current.pan.y) / transformRef.current.zoom;

    if (isDraggingRef.current) {
      // Dragging node
      const node = isDraggingRef.current;
      node.x = worldX + dragOffsetRef.current.x;
      node.y = worldY + dragOffsetRef.current.y;
      node.vx = 0;
      node.vy = 0;
    } else if (e.buttons === 1) {
      // Panning canvas
      setPan({
        x: clientX - dragOffsetRef.current.x,
        y: clientY - dragOffsetRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.05;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(zoom * zoomFactor, 3);
    } else {
      newZoom = Math.max(zoom / zoomFactor, 0.4);
    }
    setZoom(newZoom);
  };

  const resetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      style={{
        flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc",
        border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", position: "relative",
        height: isFullscreen ? "100vh" : "68vh",
        ...(isFullscreen ? {
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          borderRadius: 0, border: "none"
        } : {})
      }}
    >
      {/* Control Bar */}
      <div style={{
        position: "absolute", left: 16, top: 16, display: "flex", gap: 6, zIndex: 10,
        background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(4px)",
        padding: 4, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
      }}>
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} style={btnStyle} title="Zoom In"><ZoomIn size={15} /></button>
        <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.4))} style={btnStyle} title="Zoom Out"><ZoomOut size={15} /></button>
        <button onClick={resetZoomPan} style={btnStyle} title="Reset View"><RotateCcw size={15} /></button>
        <div style={{ width: 1, height: 16, background: "#cbd5e1", margin: "4px 2px" }} />
        <button onClick={() => setIsFullscreen(!isFullscreen)} style={btnStyle} title="Fullscreen">
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Legend / Info card */}
      <div style={{
        position: "absolute", right: 16, top: 16, zIndex: 10, maxWidth: 220,
        background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(4px)",
        padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
          <GitBranch size={13} style={{ color: "var(--v)" }} />
          PETA HUBUNGAN TUGAS
        </div>
        <p style={{ fontSize: 9, color: "#64748b", margin: "0 0 8px 0", lineHeight: 1.35 }}>
          Ingin menghubungkan tugas? Tulis <code>[[Judul Kartu Lain]]</code> di dalam deskripsi kartu Anda untuk menggambar garis hubungan di bawah ini secara otomatis!
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 9, color: "#475569" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }} />
            <span>Kolom Papan (Grup)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7" }} />
            <span>Kartu Tugas Anda</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ borderTop: "2px dashed rgba(109, 40, 217, 0.5)", width: 14, height: 1 }} />
            <span>Garis Penghubung Tugas</span>
          </div>
        </div>
        <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 8, textAlign: "right" }}>
          Klik 2x kartu untuk lihat detail
        </div>
      </div>

      {/* Physics Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ width: "100%", height: "100%", display: "block", cursor: isDraggingRef.current ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Render Card details modal directly from Graph */}
      {selectedCard && (
        <CardDetailsModal
          id={selectedCard.id}
          boardId={boardId}
          title={selectedCard.title}
          description={selectedCard.description || ""}
          onClose={() => {
            setSelectedCard(null);
            // Redraw/Refresh parent state if needed
          }}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none", border: "none", width: 26, height: 26, borderRadius: 6,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  color: "#475569", transition: "all 0.15s ease",
  outline: "none",
};
