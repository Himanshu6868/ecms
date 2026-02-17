import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";

const iconByTone = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const stylesByTone = {
  success: "border-primary/35 bg-primary/10 text-primary",
  error: "border-state-error/40 bg-state-error/10 text-state-error",
  info: "border-info-600/20 bg-info-100 text-info-600",
};

export function InlineToast({ message, tone = "info" }: { message: string; tone?: Tone }) {
  const Icon = iconByTone[tone];

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium", stylesByTone[tone])}>
      <Icon className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
