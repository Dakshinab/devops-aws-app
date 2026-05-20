import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.post.count(),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : null;
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : null;
    const authorId = typeof body.authorId === "string" ? body.authorId.trim() : "";
    const published = Boolean(body.published);

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "Title must be under 200 characters" },
        { status: 400 }
      );
    }

    if (!authorId) {
      return NextResponse.json(
        { error: "Author ID is required" },
        { status: 400 }
      );
    }

    if (!isValidUuid(authorId)) {
      return NextResponse.json(
        { error: "Author ID is not a valid UUID" },
        { status: 400 }
      );
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!author) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        published,
        authorId,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Post create error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}