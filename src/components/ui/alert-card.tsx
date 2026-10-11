"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants, type HTMLMotionProps } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AlertCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  isVisible: boolean;
  onDismiss?: () => void;
}

const AlertCard = React.forwardRef<HTMLDivElement, AlertCardProps>(
  (
    {
      className,
      icon,
      title,
      description,
      buttonText,
      onButtonClick,
      isVisible,
      onDismiss,
      style,
      ...props
    },
    ref
  ) => {
    // Animation variants for the card container
    const cardVariants: Variants = {
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
          staggerChildren: 0.08,
        },
      },
      exit: {
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: { duration: 0.2 },
      },
    };

    // Animation variants for child elements for a staggered effect
    const itemVariants: Variants = {
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0 },
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl p-4 sm:p-5 shadow-xl",
              "bg-gradient-to-br from-violet-700 via-indigo-600 to-purple-800 text-white border border-purple-400/25",
              className
            )}
            style={{
              boxShadow: "0 12px 30px -6px rgba(109, 40, 217, 0.45)",
              ...style,
            }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alert"
            aria-live="polite"
            {...props}
          >
            {/* Optional dismiss button */}
            {onDismiss && (
              <motion.div variants={itemVariants} className="absolute top-2.5 right-2.5 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  onClick={onDismiss}
                  title="Tutup banner"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              </motion.div>
            )}

            {/* Icon with a subtle pulse animation */}
            {icon && (
              <motion.div
                variants={itemVariants}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shadow-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  {icon}
                </motion.div>
              </motion.div>
            )}

            {/* Title */}
            <motion.h3
              variants={itemVariants}
              className="text-base sm:text-lg font-extrabold tracking-tight text-white pr-10"
              style={{ letterSpacing: "-0.02em" }}
            >
              {title}
            </motion.h3>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-1.5 text-xs text-purple-100/90 leading-relaxed max-w-[85%]"
            >
              {description}
            </motion.p>

            {/* Action Button */}
            <motion.div variants={itemVariants} className="mt-4">
              <Button
                className="w-full rounded-xl bg-white py-2 text-xs font-bold text-indigo-700 shadow-md hover:bg-white/95 active:scale-95 transition-all duration-200"
                onClick={onButtonClick}
              >
                {buttonText}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

AlertCard.displayName = "AlertCard";

export { AlertCard };
