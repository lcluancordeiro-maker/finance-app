import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, HttpError } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: lessonId } = await params;
    const body = await request.json();
    const answers: Record<string, number> = body?.answers ?? {};

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return NextResponse.json({ error: "Lição não encontrada." }, { status: 404 });

    const questions = await prisma.quizQuestion.findMany({ where: { lessonId } });

    let score = 0;
    const results = questions.map((q) => {
      const selected = answers[q.id];
      const correct = selected === q.correctIndex;
      if (correct) score += 1;
      return { questionId: q.id, correct, correctIndex: q.correctIndex };
    });

    const total = questions.length;
    const completed = total > 0 && score === total;

    await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed, quizScore: score, quizTotal: total },
      create: { userId, lessonId, completed, quizScore: score, quizTotal: total },
    });

    return NextResponse.json({ score, total, completed, results });
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
