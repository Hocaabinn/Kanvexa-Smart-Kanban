"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AlertCardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  isVisible: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
};

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  isVisible
}) => {
  if (!isVisible) return null;
  return (
    <div className="relative w-full rounded-2xl p-5 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1 text-xs text-purple-100">{description}</p>
      <Button className="mt-4 w-full rounded-full bg-white text-purple-700" onClick={onButtonClick}>
        {buttonText}
      </Button>
    </div>
  );
};
