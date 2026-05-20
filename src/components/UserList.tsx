type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export default function UserList({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6 text-center text-stone-500">
        No guests yet.
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      {users.map((user, index) => (
        <li
          key={user.id}
          className={`flex items-center justify-between gap-4 px-6 py-4 ${
            index !== users.length - 1 ? "border-b border-stone-100" : ""
          }`}
        >
          <div>
            <p className="font-medium text-stone-900">
              {user.name ?? "Unnamed guest"}
            </p>
            <p className="text-sm text-stone-500">{user.email}</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-stone-400">
              Guest
            </span>
            <p className="mt-1 text-xs text-stone-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}