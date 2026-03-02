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
      <div className="admin-table-scrollbar max-h-[480px] overflow-x-auto overflow-y-auto rounded-[8px] border border-border-default">
        <table className="w-full min-w-[840px] table-fixed text-sm">
          <thead>
            <tr className="bg-bg-surface text-left text-text-secondary">
              <th className="sticky top-0 z-10 min-w-[180px] border-b border-border-default bg-bg-surface px-4 py-3 text-table-header">Name</th>
              <th className="sticky top-0 z-10 min-w-[320px] border-b border-border-default bg-bg-surface px-4 py-3 text-table-header">Email</th>
              <th className="sticky top-0 z-10 min-w-[140px] border-b border-border-default bg-bg-surface px-4 py-3 text-table-header">Role</th>
              <th className="sticky top-0 z-10 min-w-[200px] border-b border-border-default bg-bg-surface px-4 py-3 text-table-header">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border-default transition-colors hover:bg-panel-elevated">
                <td className="px-4 py-3 font-medium text-text-primary">{user.name}</td>
                <td className="px-4 py-3 text-soft">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{user.email}</span>
                </td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3 text-soft whitespace-nowrap">{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
