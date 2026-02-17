import { EmptyState } from "@/components/ui/empty-state";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export function AdminUsersTable({ users }: { users: AdminUserRecord[] }) {
  if (!users.length) {
    return <EmptyState title="No users found" description="Users created in the system will appear here." />;
  }

  return (
    <section className="surface space-y-4 p-5 md:p-6">
      <div>
        <h2 className="text-section-title tracking-tight">All Users</h2>
        <p className="mt-1 text-body text-soft">Super admin view for user directory and role visibility.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-brand-100/75 text-left text-ink-700">
              <th className="px-4 py-3 text-table-header">Name</th>
              <th className="px-4 py-3 text-table-header">Email</th>
              <th className="px-4 py-3 text-table-header">Role</th>
              <th className="px-4 py-3 text-table-header">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-brand-100">
                <td className="px-4 py-3 font-medium text-ink-900">{user.name}</td>
                <td className="px-4 py-3 text-soft">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3 text-soft">{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
