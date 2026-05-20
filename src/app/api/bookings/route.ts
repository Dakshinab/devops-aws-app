import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
}

function daysBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;
    const userId = searchParams.get("userId");
    const roomId = searchParams.get("roomId");

    const where: Record<string, unknown> = {};
    if (userId && isValidUuid(userId)) where.userId = userId;
    if (roomId && isValidUuid(roomId)) where.roomId = roomId;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          room: {
            select: { id: true, name: true, pricePerNight: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";
    const guests = parseInt(body.guests ?? "1");
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    if (!userId || !isValidUuid(userId)) {
      return NextResponse.json(
        { error: "Valid user ID is required" },
        { status: 400 }
      );
    }

    if (!roomId || !isValidUuid(roomId)) {
      return NextResponse.json(
        { error: "Valid room ID is required" },
        { status: 400 }
      );
    }

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: "Valid check-in and check-out dates are required" },
        { status: 400 }
      );
    }

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    if (isNaN(guests) || guests < 1 || guests > 20) {
      return NextResponse.json(
        { error: "Guests must be between 1 and 20" },
        { status: 400 }
      );
    }

    const [user, room] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, pricePerNight: true, maxGuests: true, available: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    if (!room.available) {
      return NextResponse.json(
        { error: "Room is not available" },
        { status: 409 }
      );
    }

    if (guests > room.maxGuests) {
      return NextResponse.json(
        { error: `Room allows a maximum of ${room.maxGuests} guests` },
        { status: 400 }
      );
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: "CANCELLED" },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Room is already booked for these dates" },
        { status: 409 }
      );
    }

    const nights = daysBetween(checkIn, checkOut);
    const totalPrice = nights * room.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        room: { select: { id: true, name: true, pricePerNight: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking create error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}