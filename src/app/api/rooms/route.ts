import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;
    const available = searchParams.get("available");

    const where = available === "true"
      ? { available: true }
      : available === "false"
      ? { available: false }
      : {};

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Rooms fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const pricePerNight = parseInt(body.pricePerNight);
    const maxGuests = parseInt(body.maxGuests ?? "2");
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : null;

    if (!name) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Room name must be under 100 characters" },
        { status: 400 }
      );
    }

    if (isNaN(pricePerNight) || pricePerNight < 1) {
      return NextResponse.json(
        { error: "Price per night must be a positive number" },
        { status: 400 }
      );
    }

    if (isNaN(maxGuests) || maxGuests < 1 || maxGuests > 20) {
      return NextResponse.json(
        { error: "Max guests must be between 1 and 20" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        description,
        pricePerNight,
        maxGuests,
        imageUrl,
        available: true,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Room create error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}