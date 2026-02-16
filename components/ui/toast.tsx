import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";

const iconByTone = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const stylesByTone = {
  success: "border-success-600/20 bg-success-100 text-success-600",
  error: "border-error-600/20 bg-error-100 text-error-600",
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
