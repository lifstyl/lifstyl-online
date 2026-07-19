import type { ResourceLink } from "@/lib/db/schema";

type Group = { label: string; note: string; links: ResourceLink[] };

/**
 * Renders grouped outbound links as cards. Used for pages that are essentially
 * "a heading + grouped links out" (quarterly meetings, marketing vendors).
 */
export function ResourceGroups({
  groups,
  emptyLabel = "Nothing has been added here yet.",
}: {
  groups: Group[];
  emptyLabel?: string;
}) {
  if (groups.length === 0) {
    return <p className="text-text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, i) => (
        <div
          key={`${group.label}-${i}`}
          className="rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-7"
        >
          {group.label && (
            <h2 className="font-serif text-xl text-navy">{group.label}</h2>
          )}
          {group.note && (
            <p className="mt-2 text-sm leading-relaxed text-text-body">
              {group.note}
            </p>
          )}
          <ul className="mt-5 flex flex-wrap gap-3">
            {group.links.map((link) => {
              const isExternal = /^https?:\/\//.test(link.url);
              return (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="btn-gold"
                  >
                    {link.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
