import type { TutorialPublicPiece } from "lib/tutorial-blocks";

function embedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProductTutorialView({
  title,
  pieces,
}: {
  title: string;
  pieces: TutorialPublicPiece[];
}) {
  return (
    <article className="prose prose-zinc max-w-none">
      <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
      {pieces.length === 0 ? (
        <p className="text-zinc-600">No tutorial content has been published for this product yet.</p>
      ) : null}
      <div className="mt-8 space-y-10 not-prose">
        {pieces.map((piece, i) => {
          if (piece.type === "richtext") {
            return (
              <div
                key={`rt-${i}`}
                className="tutorial-rich max-w-none text-zinc-800 [&_a]:text-emerald-700 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: piece.html }}
              />
            );
          }
          if (piece.type === "image") {
            return (
              <div key={`img-${i}`} className="w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Strapi URLs */}
                <img src={piece.url} alt="" className="h-auto w-full object-contain" />
              </div>
            );
          }
          if (piece.type === "videoFile") {
            return (
              <video
                key={`vf-${i}`}
                src={piece.url}
                className="w-full max-w-3xl rounded-xl border border-zinc-200"
                controls
              />
            );
          }
          const embed = embedSrc(piece.url);
          if (embed) {
            return (
              <div
                key={`em-${i}`}
                className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200 bg-black"
              >
                <iframe
                  title="Video"
                  src={embed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          return (
            <p key={`lnk-${i}`} className="text-sm text-zinc-600">
              <a href={piece.url} className="font-medium text-emerald-700 underline" target="_blank" rel="noreferrer">
                Open video link
              </a>
            </p>
          );
        })}
      </div>
    </article>
  );
}
