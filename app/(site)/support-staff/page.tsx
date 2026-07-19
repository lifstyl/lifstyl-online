import { PageHeader } from "@/components/page-header";
import { getStaffMembers } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Support Staff | Lifstyl Online" };

export default async function SupportStaffPage() {
  const staff = await getStaffMembers();

  return (
    <>
      <PageHeader
        eyebrow="The team behind the agents"
        title="Support Staff"
        intro="Meet the Lifstyl support team here to help you run your business."
      />
      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 pb-24 sm:px-10">
          {staff.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col overflow-hidden rounded-sm border border-border bg-pure-white"
                >
                  <div className="aspect-[4/3] w-full bg-white">
                    {member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-navy/5">
                        <span className="font-serif text-4xl text-navy/30">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-serif text-xl text-navy">
                      {member.name}
                    </h2>
                    {member.title && (
                      <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-gold">
                        {member.title}
                      </p>
                    )}
                    {member.bio && (
                      <p className="mt-3 text-sm leading-relaxed text-text-body">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-border bg-pure-white p-10 text-center">
              <p className="font-serif text-xl text-navy">
                Staff directory coming soon
              </p>
              <p className="mt-2 text-sm text-text-muted">
                No staff members have been added yet. An admin can add them from
                Admin → Support Staff.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
