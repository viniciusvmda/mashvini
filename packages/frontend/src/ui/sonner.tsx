import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-7" strokeWidth={2.5} />,
        info: <InfoIcon className="size-7" strokeWidth={2.5} />,
        warning: <TriangleAlertIcon className="size-7" strokeWidth={2.5} />,
        error: <OctagonXIcon className="size-7" strokeWidth={2.5} />,
        loading: <Loader2Icon className="size-7 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "420px",
          "--error-bg": "color-mix(in oklch, var(--destructive) 12%, var(--popover))",
          "--error-border": "color-mix(in oklch, var(--destructive) 45%, transparent)",
          "--error-text": "var(--destructive)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast gap-4! p-5 text-base",
          title: "text-base font-semibold",
          description: "text-base",
          actionButton: "h-10! px-4! text-base!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
