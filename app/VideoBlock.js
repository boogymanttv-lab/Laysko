import { videoKind } from "@/lib/home";

export default function VideoBlock({ title, videos }) {
  const items = videos.map((v) => ({ ...v, k: videoKind(v.url) })).filter((v) => v.k);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container">
        <h2 className="sec-title">{title}</h2>
        <div className="videos">
          {items.map((v, i) => (
            <figure key={i} className="vid">
              <div className="vid-frame">
                {v.k.type === "iframe"
                  ? <iframe src={v.k.src} title={v.title || `Клип ${i + 1}`} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
                  : <video src={v.k.src} controls playsInline muted loop preload="metadata" />}
              </div>
              {v.title && <figcaption>{v.title}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
