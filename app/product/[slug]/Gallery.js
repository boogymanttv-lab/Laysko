"use client";
import { useState } from "react";

export default function Gallery({ images, alt }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="gallery"><div className="main" /></div>;
  return (
    <div className="gallery">
      <img className="main" src={images[i]} alt={alt} />
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, idx) => (
            <img key={src + idx} src={src} alt="" className={idx === i ? "on" : ""} onClick={() => setI(idx)} />
          ))}
        </div>
      )}
    </div>
  );
}
