import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    return NextResponse.json(
      { error: "Invalid post ID" },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Post fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    return NextResponse.json(
      { error: "Invalid post ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : body.content === null
        ? null
        : undefined;
    const imageUrl =
      typeof body.imageUrl === "string"
        ? body.imageUrl.trim()
        : body.imageUrl === null
        ? null
        : undefined;
    const published =
      typeof body.published === "boolean" ? body.published : undefined;

    if (title !== undefined && title.length === 0) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    if (title !== undefined && title.length > 200) {
      return NextResponse.json(
        { error: "Title must be under 200 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(published !== undefined ? { published } : {}),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Post update error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    return NextResponse.json(
      { error: "Invalid post ID" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("Post delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}