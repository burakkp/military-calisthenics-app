import type { Exercise } from '../types';

interface ExerciseDetailProps {
  exercise: Exercise;
}

export default function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Exercise Details</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">{exercise.name}</h2>
        </div>
      </div>
      <div className="space-y-4 text-slate-200">
            {exercise.media && exercise.media.length > 0 && (
              <div className="mb-4">
                {exercise.media.map((m, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                    {m.type === 'video' ? (
                      <video
                        playsInline
                        controls
                        muted
                        loop
                        poster={m.poster}
                        className="w-full h-auto bg-black"
                        preload="none"
                      >
                        <source src={m.src} type={m.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                        Your browser does not support the video tag.
                      </video>
                    ) : m.type === 'gif' || m.type === 'image' ? (
                      // images and gifs
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img loading="lazy" src={m.src} alt={m.alt ?? exercise.name} className="w-full h-auto" />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
        <div>
          <h3 className="text-sm font-semibold uppercase text-slate-400">Description</h3>
          <p className="mt-2 text-sm leading-6">{exercise.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase text-slate-400">Easier variation</h3>
          <p className="mt-2 text-sm leading-6">{exercise.easierVariation}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase text-slate-400">Common mistakes</h3>
          <p className="mt-2 text-sm leading-6">{exercise.commonMistakes}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase text-slate-400">Safety tips</h3>
          <p className="mt-2 text-sm leading-6">{exercise.safetyTips}</p>
        </div>
      </div>
    </section>
  );
}
