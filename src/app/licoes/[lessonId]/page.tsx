"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Question = { id: string; question: string; options: string[]; orderIndex: number };
type LessonDetail = {
  id: string;
  trackId: string;
  slug: string;
  title: string;
  videoUrl: string | null;
  content: string;
  questions: Question[];
  progress: { completed: boolean; quizScore: number | null; quizTotal: number | null } | null;
};
type QuizResult = {
  score: number;
  total: number;
  completed: boolean;
  results: { questionId: string; correct: boolean; correctIndex: number }[];
};

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${params.lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data);
        setLoading(false);
      });
  }, [params.lessonId]);

  async function submitQuiz() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${params.lessonId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-sm text-[#898781]">Carregando...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-sm text-[#898781]">Lição não encontrada.</p>
      </div>
    );
  }

  const allAnswered = lesson.questions.every((q) => answers[q.id] != null);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Link href="/licoes" className="text-sm text-[#2a78d6] hover:underline">
        ← Lições
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{lesson.title}</h1>

      <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-[#0b0b0b] dark:text-[#ffffff]">
        {lesson.content}
      </div>

      {lesson.questions.length > 0 && (
        <section className="mt-8 rounded-lg border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-[#fcfcfb] dark:bg-[#1a1a19] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#52514e] dark:text-[#c3c2b7]">Quiz</h2>
          <div className="space-y-6">
            {lesson.questions.map((q, qIdx) => {
              const questionResult = result?.results.find((r) => r.questionId === q.id);
              return (
                <div key={q.id}>
                  <p className="text-sm font-medium">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const selected = answers[q.id] === optIdx;
                      const isCorrectOption = questionResult && optIdx === questionResult.correctIndex;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!!result}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                          className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                            result
                              ? isCorrectOption
                                ? "border-[#0ca30c] bg-[#0ca30c]/10"
                                : selected
                                  ? "border-[#d03b3b] bg-[#d03b3b]/10"
                                  : "border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)]"
                              : selected
                                ? "border-[#2a78d6] bg-[#2a78d6]/10"
                                : "border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!result ? (
            <button
              onClick={submitQuiz}
              disabled={!allAnswered || submitting}
              className="mt-6 rounded-md bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Corrigir"}
            </button>
          ) : (
            <div className="mt-6">
              <p className={`text-sm font-medium ${result.completed ? "text-[#0ca30c]" : "text-[#d03b3b]"}`}>
                Você acertou {result.score} de {result.total}
                {result.completed ? " — lição concluída!" : " — acerte todas para concluir a lição."}
              </p>
              {!result.completed && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                  }}
                  className="mt-3 text-sm text-[#2a78d6] hover:underline"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
