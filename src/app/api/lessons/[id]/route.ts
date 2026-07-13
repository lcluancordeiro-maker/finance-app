import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, HttpError } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        progress: { where: { userId } },
      },
    });
    if (!lesson) return NextResponse.json({ error: "Lição não encontrada." }, { status: 404 });

    const progress = lesson.progress[0] ?? null;

    return NextResponse.json({
      id: lesson.id,
      trackId: lesson.trackId,
      slug: lesson.slug,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      questions: lesson.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        orderIndex: q.orderIndex,
      })),
      progress: progress
        ? { completed: progress.completed, quizScore: progress.quizScore, quizTotal: progress.quizTotal }
        : null,
    });
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
