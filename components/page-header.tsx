/**
 * Standard header band for inner pages: an eyebrow tag + large serif title.
 * Also supplies the top padding needed to clear the fixed nav.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="bg-gradient-to-b from-white to-pure-white">
      <div className="mx-auto max-w-content px-6 pb-12 pt-32 sm:px-10 sm:pt-36">
        {eyebrow && <span className="section-tag mb-5">{eyebrow}</span>}
        <h1 className="mt-4 max-w-3xl text-balance font-serif text-4xl leading-tight text-navy sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-body">
            {intro}
          </p>
        )}
      </div>
    </header>
  );
}
