"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  completed: boolean;
  quizScore: number | null;
  quizTotal: number | null;
};
type Track = { id: string; slug: string; title: string; description: string; level: string; lessons: Lesson[] };

export default function LicoesPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tracks")
      .then((res) => res.json())
      .then((data) => {
        setTracks(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Lições</h1>
        <p className="mt-1 text-sm text-[#52514e] dark:text-[#c3c2b7]">
          Aprenda economia e finanças em trilhas curtas, com um quiz ao final de cada lição.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-[#898781]">Carregando...</p>
      ) : (
        <div className="space-y-8">
          {tracks.map((track) => (
            <section
              key={track.id}
              className="rounded-lg border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-[#fcfcfb] dark:bg-[#1a1a19] p-5"
            >
              <div className="mb-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#2a78d6]">{track.level}</span>
                <h2 className="text-lg font-semibold">{track.title}</h2>
                <p className="text-sm text-[#52514e] dark:text-[#c3c2b7]">{track.description}</p>
              </div>
              <ul className="divide-y divide-[rgba(11,11,11,0.10)] dark:divide-[rgba(255,255,255,0.10)]">
                {track.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between py-2.5">
                    <Link href={`/licoes/${lesson.id}`} className="text-sm hover:underline">
                      {lesson.title}
                    </Link>
                    {lesson.completed ? (
                      <span className="text-xs text-[#0ca30c]">
                        concluída{lesson.quizTotal ? ` · ${lesson.quizScore}/${lesson.quizTotal}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-[#898781]">pendente</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
