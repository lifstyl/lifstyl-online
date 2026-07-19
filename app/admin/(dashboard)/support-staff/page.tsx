import { getStaffMembers } from "@/lib/content";
import { addStaff, updateStaff, deleteStaff, moveStaff } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { RowActions } from "@/components/admin/row-actions";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminSupportStaffPage() {
  const staff = await getStaffMembers();

  return (
    <>
      <EditorHeader
        title="Support Staff"
        description="The staff directory shown on the Support Staff page."
        previewHref="/support-staff"
      />

      <Card className="mb-8 border-t-2 border-t-gold">
        <h2 className="mb-4 font-serif text-lg text-navy">Add a staff member</h2>
        <form action={addStaff} className="flex flex-col gap-4">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Title / role">
            <input name="title" className={inputClass} placeholder="e.g. Transaction Coordinator" />
          </Field>
          <Field label="Short bio (optional)">
            <textarea name="bio" rows={3} className={inputClass} />
          </Field>
          <Field label="Photo (optional)">
            <input type="file" name="photo" accept="image/*" className="text-sm" />
          </Field>
          <div>
            <SubmitButton>Add staff member</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {staff.map((member, i) => (
          <Card key={member.id}>
            <form action={updateStaff} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={member.id} />
              <div className="flex items-start gap-4">
                {member.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="h-16 w-16 rounded-sm object-cover"
                  />
                )}
                <div className="flex-1 space-y-4">
                  <Field label="Name">
                    <input name="name" defaultValue={member.name} required className={inputClass} />
                  </Field>
                  <Field label="Title / role">
                    <input name="title" defaultValue={member.title} className={inputClass} />
                  </Field>
                </div>
              </div>
              <Field label="Short bio">
                <textarea name="bio" defaultValue={member.bio} rows={3} className={inputClass} />
              </Field>
              <Field label="Replace photo (optional)">
                <input type="file" name="photo" accept="image/*" className="text-sm" />
              </Field>
              <div>
                <SubmitButton variant="ghost">Save changes</SubmitButton>
              </div>
            </form>
            <div className="mt-4 border-t border-border pt-4">
              <RowActions
                id={member.id}
                moveAction={moveStaff}
                deleteAction={deleteStaff}
                isFirst={i === 0}
                isLast={i === staff.length - 1}
              />
            </div>
          </Card>
        ))}
        {staff.length === 0 && (
          <p className="text-sm text-text-muted">
            No staff members yet. Add one above.
          </p>
        )}
      </div>
    </>
  );
}
