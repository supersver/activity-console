import type { ReactNode } from "react";

interface NoticeProps {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "error";
}

const TONE_STYLES: Record<NonNullable<NoticeProps["tone"]>, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export function Notice({ children, tone = "info" }: NoticeProps) {
  return (
    <div className={`rounded border px-3 py-2 text-sm ${TONE_STYLES[tone]}`}>
      {children}
    </div>
  );
}
