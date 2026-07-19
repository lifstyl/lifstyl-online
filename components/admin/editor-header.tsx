export function EditorHeader({
  title,
  description,
  previewHref,
}: {
  title: string;
  description?: string;
  previewHref?: string;
}) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-navy">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-text-body">{description}</p>
        )}
      </div>
      {previewHref && (
        <a
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-sm border border-border px-3 py-2 text-sm text-text-body transition hover:bg-white"
        >
          View page ↗
        </a>
      )}
    </header>
  );
}

/** Light card wrapper for grouping a form or a list row. */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-sm border border-border bg-pure-white p-6 ${className}`}
    >
      {children}
    </div>
  );
}
