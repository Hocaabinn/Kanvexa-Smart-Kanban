import React from "react";

interface KanvexaLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  imgClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  variant?: "full" | "icon" | "wordmark" | "badge";
  color?: string;
  alt?: string;
  src?: string;
  useVector?: boolean;
}

/**
 * KanvexaIcon - Official stylized 'K' emblem SVG mark
 */
export function KanvexaIcon({
  className = "w-8 h-8",
  color = "currentColor",
  ...props
}: React.SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M 12 0 H 38 C 30 16 22 28 20 44 C 28 56 34 76 38 100 H 12 C 6 82 0 68 0 46 C 0 26 6 12 12 0 Z"
        fill={color}
      />
      <path
        d="M 46 0 H 90 L 52 46 L 34 30 Z"
        fill={color}
      />
      <path
        d="M 34 68 L 52 52 L 90 100 H 46 Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * KanvexaLogo - Flexible Kanvexa brand logo component
 */
export function KanvexaLogo({
  className = "",
  imgClassName = "h-9 w-auto rounded-lg object-contain",
  iconClassName = "h-6 w-6 text-violet-600",
  textClassName = "text-xl font-extrabold tracking-tight text-slate-900",
  variant = "full",
  color = "currentColor",
  alt = "Kanvexa",
  src,
  useVector = false,
  ...props
}: KanvexaLogoProps) {
  if (variant === "icon") {
    return <KanvexaIcon className={iconClassName} color={color} />;
  }

  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-[#7C3AED] text-white px-3 py-1.5 rounded-xl shadow-sm select-none ${className}`}
        {...props}
      >
        <KanvexaIcon className="h-5 w-5 text-white" color="#FFFFFF" />
        <span
          className="text-lg font-extrabold tracking-tight text-white font-sans"
          style={{
            fontFamily:
              "'Plus Jakarta Sans', 'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.03em",
          }}
        >
          anvexa
        </span>
      </div>
    );
  }

  if (src && !useVector) {
    return (
      <div className={`inline-flex items-center select-none ${className}`} {...props}>
        <img
          src={src}
          alt={alt}
          className={imgClassName}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`} {...props}>
      <KanvexaIcon className={iconClassName} color={color !== "currentColor" ? color : undefined} />
      <span
        className={`font-sans ${textClassName}`}
        style={{
          fontFamily:
            "'Plus Jakarta Sans', 'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.03em",
        }}
      >
        anvexa
      </span>
    </div>
  );
}

export default KanvexaLogo;
