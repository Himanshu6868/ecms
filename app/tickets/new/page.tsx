import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TicketCreateForm } from "@/components/TicketCreateForm";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Create Ticket</h1>
      <TicketCreateForm />
    </main>
  );
}
