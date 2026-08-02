"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, forwardRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Project {
  id: string;
  image: string;
  title: string;
}

export interface AnimatedFolderProps {
  title: string;
  projects: Project[];
  className?: string;
  onClickFolder?: () => void;
  subtitle?: string;
  isPinned?: boolean;
  isStarred?: boolean;
  showOpenButton?: boolean;
}

export function AnimatedFolder({
  title,
  projects,
  className,
  onClickFolder,
  subtitle,
  isPinned,
  isStarred,
  showOpenButton,
}: AnimatedFolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  const projectsKey = projects.map((p) => p.id).join(",");
  const currentProjects = useMemo(() => {
    return projects.map((p) => {
      const customImg = customImages[p.id];
      if (customImg) return { ...p, image: customImg };

      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`kanvexa_img_${p.id}`);
        if (saved) return { ...p, image: saved };
      }
      return p;
    });
  }, [projectsKey, customImages]);

  const handleUpdateProjectImage = (projectId: string, newImage: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`kanvexa_img_${projectId}`, newImage);
      } catch (err) {
        console.warn("localStorage quota exceeded", err);
      }
    }
    setCustomImages((prev) => ({
      ...prev,
      [projectId]: newImage,
    }));
  };

  const handleProjectClick = (project: Project, index: number) => {
    const cardEl = cardRefs.current[index];
    if (cardEl) {
      setSourceRect(cardEl.getBoundingClientRect());
    }
    setSelectedIndex(index);
    setHiddenCardId(project.id);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
    setSourceRect(null);
  };

  const handleCloseComplete = () => {
    setHiddenCardId(null);
  };

  const handleNavigate = (newIndex: number) => {
    setSelectedIndex(newIndex);
    setHiddenCardId(currentProjects[newIndex]?.id || null);
  };

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center",
          "p-4 rounded-2xl cursor-pointer",
          "transition-all duration-500 ease-out",
          "hover:shadow-2xl hover:shadow-purple-500/20",
          "group",
          className
        )}
        style={{
          minWidth: "210px",
          minHeight: "210px",
          perspective: "1000px",
          background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 45%, #f3e8ff 100%)",
          border: "1.5px solid #d8b4fe",
          boxShadow: isHovered
            ? "0 14px 30px rgba(124, 58, 237, 0.16)"
            : "0 4px 14px rgba(124, 58, 237, 0.06)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClickFolder}
      >
        {/* Badges top right */}
        {(isStarred || isPinned) && (
          <div className="absolute top-2.5 right-2.5 flex gap-1 z-40">
            {isStarred && (
              <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[10px] shadow-sm">⭐</span>
            )}
            {isPinned && (
              <span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[10px] shadow-sm">📌</span>
            )}
          </div>
        )}

        {/* Subtle background glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 70%, rgba(147, 51, 234, 0.18) 0%, transparent 70%)",
            opacity: isHovered ? 1 : 0,
          }}
        />

        <div className="relative flex items-center justify-center mb-1" style={{ height: "110px", width: "150px" }}>
          {/* Folder back layer - z-index 10 */}
          <div
            className="absolute w-28 h-20 rounded-lg shadow-md"
            style={{
              background: isPinned
                ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                : "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-15deg)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />

          {/* Folder tab - z-index 10 */}
          <div
            className="absolute w-10 h-3.5 rounded-t-md"
            style={{
              background: isPinned ? "#059669" : "#6d28d9",
              top: "calc(50% - 40px - 10px)",
              left: "calc(50% - 56px + 14px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-25deg) translateY(-2px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />

          {/* Project cards - z-index 20, between back and front */}
          <div
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
            }}
          >
            {currentProjects.slice(0, 3).map((project, index) => (
              <ProjectCard
                key={project.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                image={project.image}
                title={project.title}
                delay={index * 80}
                isVisible={isHovered}
                index={index}
                onClick={() => handleProjectClick(project, index)}
                isSelected={hiddenCardId === project.id}
              />
            ))}
          </div>

          {/* Folder front layer - z-index 30 */}
          <div
            className="absolute w-28 h-20 rounded-lg shadow-lg"
            style={{
              background: isPinned
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              top: "calc(50% - 40px + 4px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(25deg) translateY(6px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 30,
            }}
          />

          {/* Folder shine effect - z-index 31 */}
          <div
            className="absolute w-28 h-20 rounded-lg overflow-hidden pointer-events-none"
            style={{
              top: "calc(50% - 40px + 4px)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(25deg) translateY(6px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 31,
            }}
          />
        </div>

        {/* Folder title */}
        <h3
          className="text-sm font-extrabold text-slate-900 text-center transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(2px)" : "translateY(0)",
          }}
        >
          {title}
        </h3>

        {/* Subtitle / Count */}
        <p
          className="text-[11px] font-bold text-purple-700 mt-0.5 text-center transition-all duration-300"
          style={{
            opacity: isHovered ? 0.9 : 1,
          }}
        >
          {subtitle || `${projects.length} projects`}
        </p>

        {showOpenButton && (
          <div className="mt-2 flex items-center justify-center">
            <span
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                color: "#ffffff",
                padding: "6px 18px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "800",
                boxShadow: "0 3px 10px rgba(109, 40, 217, 0.3)",
              }}
              className="transition-transform duration-300 group-hover:scale-105"
            >
              Buka
            </span>
          </div>
        )}

        {/* Hover hint when open button not shown */}
        {!showOpenButton && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-purple-600 font-bold transition-all duration-300"
            style={{
              opacity: isHovered ? 0 : 0.7,
              transform: isHovered ? "translateY(8px)" : "translateY(0)",
            }}
          >
            <span>Hover to explore</span>
          </div>
        )}
      </div>

      <ImageLightbox
        projects={currentProjects.slice(0, 3)}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleCloseLightbox}
        sourceRect={sourceRect}
        onCloseComplete={handleCloseComplete}
        onNavigate={handleNavigate}
        onUpdateImage={handleUpdateProjectImage}
      />
    </>
  );
}

interface ImageLightboxProps {
  projects: Project[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  sourceRect: DOMRect | null;
  onCloseComplete?: () => void;
  onNavigate: (index: number) => void;
  onUpdateImage?: (projectId: string, newImage: string) => void;
}

export function ImageLightbox({
  projects,
  currentIndex,
  isOpen,
  onClose,
  sourceRect,
  onCloseComplete,
  onNavigate,
  onUpdateImage,
}: ImageLightboxProps) {
  const [animationPhase, setAnimationPhase] = useState<"initial" | "animating" | "complete">("initial");
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const containerRef = useRef<HTMLDivElement>(null);

  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentProject) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const newImg = evt.target!.result as string;
          setCustomImages((prev) => ({
            ...prev,
            [currentProject.id]: newImg,
          }));
          onUpdateImage?.(currentProject.id, newImg);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const totalProjects = projects.length;
  const hasNext = internalIndex < totalProjects - 1;
  const hasPrev = internalIndex > 0;

  const currentProject = projects[internalIndex];

  useEffect(() => {
    if (isOpen && currentIndex !== internalIndex && !isSliding) {
      const direction = currentIndex > internalIndex ? "left" : "right";
      setSlideDirection(direction);
      setPrevIndex(internalIndex);
      setIsSliding(true);

      const timer = setTimeout(() => {
        setInternalIndex(currentIndex);
        setIsSliding(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isOpen, internalIndex, isSliding]);

  useEffect(() => {
    if (isOpen) {
      setInternalIndex(currentIndex);
      setPrevIndex(currentIndex);
      setIsSliding(false);
    }
  }, [isOpen, currentIndex]);

  const navigateNext = useCallback(() => {
    if (internalIndex >= totalProjects - 1 || isSliding) return;
    onNavigate(internalIndex + 1);
  }, [internalIndex, totalProjects, isSliding, onNavigate]);

  const navigatePrev = useCallback(() => {
    if (internalIndex <= 0 || isSliding) return;
    onNavigate(internalIndex - 1);
  }, [internalIndex, isSliding, onNavigate]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    onClose();
    setTimeout(() => {
      setIsClosing(false);
      setShouldRender(false);
      setAnimationPhase("initial");
      onCloseComplete?.();
    }, 400);
  }, [onClose, onCloseComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") navigateNext();
      if (e.key === "ArrowLeft") navigatePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose, navigateNext, navigatePrev]);

  useLayoutEffect(() => {
    if (isOpen && sourceRect) {
      setShouldRender(true);
      setAnimationPhase("initial");
      setIsClosing(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationPhase("animating");
        });
      });
      const timer = setTimeout(() => {
        setAnimationPhase("complete");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, sourceRect]);

  const handleDotClick = (idx: number) => {
    if (isSliding || idx === internalIndex) return;
    onNavigate(idx);
  };

  if (!shouldRender || !currentProject) return null;

  const getInitialStyles = (): React.CSSProperties => {
    if (!sourceRect) return {};

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetWidth = Math.min(768, viewportWidth - 64);
    const targetHeight = Math.min(viewportHeight * 0.85, 600);

    const targetX = (viewportWidth - targetWidth) / 2;
    const targetY = (viewportHeight - targetHeight) / 2;

    const scaleX = sourceRect.width / targetWidth;
    const scaleY = sourceRect.height / targetHeight;
    const scale = Math.max(scaleX, scaleY);

    const translateX = sourceRect.left + sourceRect.width / 2 - (targetX + targetWidth / 2);
    const translateY = sourceRect.top + sourceRect.height / 2 - (targetY + targetHeight / 2);

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      opacity: 1,
    };
  };

  const getFinalStyles = (): React.CSSProperties => {
    return {
      transform: "translate(0, 0) scale(1)",
      opacity: 1,
    };
  };

  const currentStyles = animationPhase === "initial" && !isClosing ? getInitialStyles() : getFinalStyles();

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn("fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8")}
      onClick={handleClose}
      style={{
        opacity: isClosing ? 0 : 1,
        transition: "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        style={{
          opacity: animationPhase === "initial" && !isClosing ? 0 : 1,
          transition: "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className={cn(
          "absolute top-5 right-5 z-50",
          "w-10 h-10 flex items-center justify-center",
          "rounded-full bg-slate-800/60 backdrop-blur-md",
          "border border-slate-700",
          "text-slate-300 hover:text-white hover:bg-slate-800",
          "transition-all duration-300 ease-out hover:scale-105 active:scale-95"
        )}
        style={{
          opacity: animationPhase === "complete" && !isClosing ? 1 : 0,
          transform: animationPhase === "complete" && !isClosing ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Left button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigatePrev();
        }}
        disabled={!hasPrev || isSliding}
        className={cn(
          "absolute left-4 md:left-8 z-50",
          "w-12 h-12 flex items-center justify-center",
          "rounded-full bg-slate-800/60 backdrop-blur-md",
          "border border-slate-700",
          "text-slate-300 hover:text-white hover:bg-slate-800",
          "transition-all duration-300 ease-out hover:scale-110 active:scale-95",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
        style={{
          opacity: animationPhase === "complete" && !isClosing && hasPrev ? 1 : 0,
          transform: animationPhase === "complete" && !isClosing ? "translateX(0)" : "translateX(-20px)",
          transition: "opacity 300ms ease-out 150ms, transform 300ms ease-out 150ms",
        }}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* Right button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigateNext();
        }}
        disabled={!hasNext || isSliding}
        className={cn(
          "absolute right-4 md:right-8 z-50",
          "w-12 h-12 flex items-center justify-center",
          "rounded-full bg-slate-800/60 backdrop-blur-md",
          "border border-slate-700",
          "text-slate-300 hover:text-white hover:bg-slate-800",
          "transition-all duration-300 ease-out hover:scale-110 active:scale-95",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
        style={{
          opacity: animationPhase === "complete" && !isClosing && hasNext ? 1 : 0,
          transform: animationPhase === "complete" && !isClosing ? "translateX(0)" : "translateX(20px)",
          transition: "opacity 300ms ease-out 150ms, transform 300ms ease-out 150ms",
        }}
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
      </button>

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...currentStyles,
          transform: isClosing ? "translate(0, 0) scale(0.95)" : currentStyles.transform,
          transition:
            animationPhase === "initial" && !isClosing
              ? "none"
              : "transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease-out",
          transformOrigin: "center center",
        }}
      >
        <div
          className={cn("relative overflow-hidden", "rounded-2xl", "bg-white dark:bg-slate-900", "ring-1 ring-slate-200 dark:ring-slate-800", "shadow-2xl")}
          style={{
            borderRadius: animationPhase === "initial" && !isClosing ? "8px" : "16px",
            transition: "border-radius 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-400 ease-out"
              style={{
                transform: `translateX(-${internalIndex * 100}%)`,
                transition: isSliding ? "transform 400ms cubic-bezier(0.32, 0.72, 0, 1)" : "none",
              }}
            >
              {projects.map((project) => {
                const imgSrc = customImages[project.id] || project.image || "/placeholder.svg";
                return (
                  <img
                    key={project.id}
                    src={imgSrc}
                    alt={project.title}
                    className="w-full h-auto max-h-[70vh] object-contain bg-slate-900 flex-shrink-0"
                    style={{ minWidth: "100%" }}
                  />
                );
              })}
            </div>

            {/* Subtle vignette effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <div
            className={cn("px-6 py-5", "bg-white dark:bg-slate-900", "border-t border-slate-100 dark:border-slate-800")}
            style={{
              opacity: animationPhase === "complete" && !isClosing ? 1 : 0,
              transform: animationPhase === "complete" && !isClosing ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 300ms ease-out 100ms, transform 300ms ease-out 100ms",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight truncate h-7">
                  {currentProject?.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <kbd className="px-1.5 py-0.5 mx-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                      ←
                    </kbd>
                    <kbd className="px-1.5 py-0.5 mx-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                      →
                    </kbd>{" "}
                    to navigate
                  </p>
                  <div className="flex items-center gap-1.5">
                    {projects.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          idx === internalIndex
                            ? "bg-purple-600 scale-110"
                            : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2",
                    "text-xs font-bold text-slate-700 dark:text-slate-200",
                    "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
                    "rounded-xl border border-slate-300 dark:border-slate-700",
                    "transition-all duration-200 ease-out cursor-pointer"
                  )}
                  title="Ganti Foto Pratinjau"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Ganti Foto</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2",
                    "text-xs font-extrabold text-white",
                    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
                    "rounded-xl shadow-md shadow-purple-500/20",
                    "transition-all duration-200 ease-out hover:scale-105 cursor-pointer"
                  )}
                >
                  <span>Buka Dokumen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface ProjectCardProps {
  image: string;
  title: string;
  delay: number;
  isVisible: boolean;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ image, title, delay, isVisible, index, onClick, isSelected }, ref) => {
    const rotations = [-12, 0, 12];
    const translations = [-55, 0, 55];

    return (
      <div
        ref={ref}
        className={cn(
          "absolute w-20 h-28 rounded-lg overflow-hidden shadow-xl",
          "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
          "cursor-pointer hover:ring-2 hover:ring-purple-500/50",
          isSelected && "opacity-0"
        )}
        style={{
          transform: isVisible
            ? `translateY(-90px) translateX(${translations[index]}px) rotate(${rotations[index]}deg) scale(1)`
            : "translateY(0px) translateX(0px) rotate(0deg) scale(0.5)",
          opacity: isSelected ? 0 : isVisible ? 1 : 0,
          transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
          zIndex: 10 - index,
          left: "-40px",
          top: "-56px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-medium text-white truncate">
          {title}
        </p>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export interface Dashboard3DFolderCardProps {
  board: {
    id: string;
    name: string;
    created_at: string;
  };
  isPinned: boolean;
  isStarred: boolean;
  relativeTime: string;
  dateFormatted: string;
  onStarClick?: (e: React.MouseEvent) => void;
  onPinClick?: (e: React.MouseEvent) => void;
}

const DASHBOARD_PREVIEW_IMAGES = [
  { image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80", title: "Kanban Board" },
  { image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80", title: "Docs & Files" },
  { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80", title: "Calendar View" },
];

export function Dashboard3DFolderCard({
  board,
  isPinned,
  isStarred,
  relativeTime,
  dateFormatted,
}: Dashboard3DFolderCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const rotations = [-12, 0, 12];
  const translations = [-45, 0, 45];

  return (
    <div
      style={{ perspective: "1000px" }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Folder Top Tab */}
      <div style={{ display: "flex", alignItems: "flex-end", position: "relative", zIndex: 10 }}>
        <div
          style={{
            background: isPinned
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            color: "#ffffff",
            padding: "6px 18px 4px 16px",
            borderRadius: "14px 14px 0 0",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(-15deg)" : "rotateX(0deg)",
            transition: "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <span>📁 KANVEXA</span>
        </div>

        {/* Tab Slant Transition Curve */}
        <div
          style={{
            width: 22,
            height: 16,
            background: isPinned ? "#059669" : "#6d28d9",
            clipPath: "polygon(0 100%, 0 0, 100% 100%)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(-15deg)" : "rotateX(0deg)",
            transition: "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>

      {/* Main Folder Body Container */}
      <div
        style={{
          background: "#ffffff",
          borderLeft: "1.5px solid #e2e8f0",
          borderRight: "1.5px solid #e2e8f0",
          borderBottom: "1.5px solid #e2e8f0",
          borderTop: `3px solid ${isPinned ? "#10b981" : "#7c3aed"}`,
          borderRadius: "0 24px 24px 24px",
          padding: "22px 24px 20px",
          boxShadow: isHovered
            ? "0 20px 40px -10px rgba(109, 40, 217, 0.15), 0 8px 16px -4px rgba(15, 23, 42, 0.08)"
            : "0 12px 28px -6px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "250px",
          position: "relative",
          transition: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        }}
      >
        {/* Subtle background glow on hover */}
        <div
          className="absolute inset-0 rounded-b-3xl pointer-events-none transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* 3D Stacked Preview Cards (Fan Out on Hover) */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            pointerEvents: "none",
            zIndex: 15,
          }}
        >
          {DASHBOARD_PREVIEW_IMAGES.map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                width: "56px",
                height: "72px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                background: "#ffffff",
                transform: isHovered
                  ? `translateY(-45px) translateX(${translations[idx]}px) rotate(${rotations[idx]}deg) scale(1)`
                  : "translateY(0px) translateX(0px) rotate(0deg) scale(0.4)",
                opacity: isHovered ? 1 : 0,
                transition: `all 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 70}ms`,
                zIndex: 10 - idx,
              }}
            >
              <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
            </div>
          ))}
        </div>

        {/* Top Row: Logo & Status Badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", position: "relative", zIndex: 20 }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: isPinned ? "#ecfdf5" : "#f5f3ff",
              border: `1px solid ${isPinned ? "#a7f3d0" : "#ddd6fe"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isPinned ? "#059669" : "#7c3aed",
              fontSize: "18px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            📁
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {isStarred && (
              <div
                title="Favorit"
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                ⭐
              </div>
            )}
            {isPinned && (
              <div
                title="Disematkan"
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                📌
              </div>
            )}
          </div>
        </div>

        {/* Content Row */}
        <div style={{ flex: 1, marginBottom: "16px", position: "relative", zIndex: 20 }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "600" }}>
            <span>Kanvexa</span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#cbd5e1" }} />
            <span>{relativeTime}</span>
          </div>

          <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", margin: "0 0 14px", lineHeight: "1.3" }}>
            {board.name}
          </h3>

          {/* Pill Badges */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
              Kanban Board
            </span>
            <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
              Workspace
            </span>
          </div>
        </div>

        {/* Divider Line */}
        <div style={{ borderTop: "1px solid #f1f5f9", margin: "0 -24px 16px", position: "relative", zIndex: 20 }} />

        {/* Footer Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 20 }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>Proyek</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>{dateFormatted}</div>
          </div>
          <div
            style={{
              background: isHovered ? "#7c3aed" : "#0f172a",
              color: "#ffffff",
              padding: "9px 20px",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: "800",
              textAlign: "center",
              boxShadow: isHovered ? "0 6px 16px rgba(124, 58, 237, 0.35)" : "0 4px 12px rgba(15, 23, 42, 0.12)",
              transition: "all 0.25s ease",
            }}
          >
            Buka
          </div>
        </div>
      </div>
    </div>
  );
}

