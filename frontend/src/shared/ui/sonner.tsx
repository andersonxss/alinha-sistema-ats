"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      richColors
      closeButton
      offset={24}
      mobileOffset={16}
      containerAriaLabel="Notificações"
      toastOptions={{ closeButtonAriaLabel: "Fechar notificação" }}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          fontFamily: "var(--font-sans)",
          "--success-bg": "#eef7ef",
          "--success-text": "var(--primary)",
          "--success-border": "#c6dfcc",
          "--error-bg": "#fff1ef",
          "--error-text": "var(--destructive)",
          "--error-border": "#f2c5bf",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
