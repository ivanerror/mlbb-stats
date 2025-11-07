"use client";

import * as React from "react";
import { createPortal } from "react-dom";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export function LoadingOverlay({
  show,
  message = "Loading...",
}: LoadingOverlayProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!show || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white backdrop-blur-xl">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-primary shadow-[0_0_35px_rgba(99,102,241,0.65)]" />
      <p className="text-sm font-medium tracking-wide text-white/75">
        {message}
      </p>
    </div>,
    document.body,
  );
}
