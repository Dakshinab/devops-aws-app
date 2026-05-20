import { prisma } from "@/lib/db";
import UserList from "@/components/UserList";
import Link from "next/link";

async function getDashboardData() {
  const [totalBookings, totalUsers, totalRooms, recentBookings, users] =
    await Promise.all([
      prisma.booking.count(),
      prisma.user.count(),
      prisma.room.count({ where: { available: true } }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          room: { select: { name: true, pricePerNight: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

  const totalRevenue = await prisma.booking.aggregate({
    _sum: { totalPrice: true },
    where: { status: "CONFIRMED" },
  });

  return {
    totalBookings,
    totalUsers,
    totalRooms,
    totalRevenue: totalRevenue._sum.totalPrice ?? 0,
    recentBookings,
    users,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 px-6 py-16 text-stone-900 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
          Guest Dashboard
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Your reservations
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
          Live data from your AWS RDS PostgreSQL database.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
              Total bookings
            </h3>
            <p className="mt-4 text-4xl font-semibold text-stone-900">
              {data.totalBookings}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
              Available rooms
            </h3>
            <p className="mt-4 text-4xl font-semibold text-stone-900">
              {data.totalRooms}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
              Total guests
            </h3>
            <p className="mt-4 text-4xl font-semibold text-stone-900">
              {data.totalUsers}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
              Confirmed revenue
            </h3>
            <p className="mt-4 text-4xl font-semibold text-stone-900">
              LKR {data.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent bookings
            </h2>
            <Link
              href="/api/bookings"
              className="text-sm text-stone-500 underline hover:text-stone-900"
            >
              View all
            </Link>
          </div>

          {data.recentBookings.length === 0 ? (
            <div className="rounded-lg border border-stone-200 bg-white p-6 text-center text-stone-500">
              No bookings yet. Rooms are waiting!
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              {data.recentBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className={`flex items-center justify-between gap-4 px-6 py-4 ${
                    index !== data.recentBookings.length - 1
                      ? "border-b border-stone-100"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {booking.room.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      {booking.user.name ?? booking.user.email}
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(booking.checkIn).toLocaleDateString()} to{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-900">
                      LKR {booking.totalPrice.toLocaleString()}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {booking.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent guests
            </h2>
            <Link
              href="/api/users"
              className="text-sm text-stone-500 underline hover:text-stone-900"
            >
              View all
            </Link>
          </div>
          <UserList users={data.users} />
        </div>
      </div>
    </main>
  );
}