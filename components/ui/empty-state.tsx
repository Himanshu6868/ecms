import { FileSearch } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="surface-muted flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="rounded-full bg-bg-surface/80 p-3 text-text-secondary">
        <FileSearch className="h-5 w-5" />
      </span>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="max-w-md text-sm text-soft">{description}</p>
    </div>
  );
}
