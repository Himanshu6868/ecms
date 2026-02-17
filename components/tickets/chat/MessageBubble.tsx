import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  senderLabel: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export function MessageBubble({ content, senderLabel, timestamp, isCurrentUser }: MessageBubbleProps) {
  return (
    <article className={cn("flex w-full", isCurrentUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] rounded-md border px-3 py-2", isCurrentUser ? "border-panel-border bg-message-sender" : "border-panel-border bg-message-receiver")}>
        <p className="text-xs font-medium text-text-secondary">{senderLabel}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-text-primary">{content}</p>
        <time className="mt-2 block text-right text-[11px] text-text-placeholder" dateTime={timestamp}>
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
    </article>
  );
}
