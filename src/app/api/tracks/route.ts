import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, HttpError } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await requireAuth();
    const tracks = await prisma.track.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          include: {
            progress: { where: { userId } },
          },
        },
      },
    });

    const result = tracks.map((track) => ({
      id: track.id,
      slug: track.slug,
      title: track.title,
      description: track.description,
      level: track.level,
      lessons: track.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        completed: lesson.progress[0]?.completed ?? false,
        quizScore: lesson.progress[0]?.quizScore ?? null,
        quizTotal: lesson.progress[0]?.quizTotal ?? null,
      })),
    }));

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
