interface MessageRendererProps {
  content: string;
}

export function MessageRenderer({ content }: MessageRendererProps) {
  return (
    <div className="space-y-2">
      {content.split("\n\n").map((paragraph, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static paragraph splits
        <p key={i} className="text-sm leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
