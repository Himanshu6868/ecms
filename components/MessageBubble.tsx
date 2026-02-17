import { memo } from "react";

interface MessageBubbleProps {
  content: string;
  senderLabel: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export const MessageBubble = memo(function MessageBubble({ content, senderLabel, timestamp, isCurrentUser }: MessageBubbleProps) {
  return (
    <article className={`flex w-full ${isCurrentUser ? "justify-end" : "justify-start"} chat-message-fade-in`}>
      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          "whitespace-pre-wrap break-words",
          isCurrentUser ? "bg-primary text-text-primary" : "border border-border-subtle bg-bg-surface/70 text-text-primary",
        ].join(" ")}
      >
        <p className={`mb-1 text-[11px] font-medium ${isCurrentUser ? "text-text-primary/90" : "text-text-placeholder"}`}>{senderLabel}</p>
        <p>{content}</p>
        <time
          className={`mt-2 block text-right text-[11px] ${isCurrentUser ? "text-text-primary/90" : "text-text-placeholder"}`}
          dateTime={timestamp}
        >
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
    </article>
  );
});
