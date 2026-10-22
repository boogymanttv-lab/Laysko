// Оригинално котенце-лого (SVG). Цветът следва акцентния цвят на сайта.
export default function CatLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Laysko" style={{ flex: "none" }}>
      <path d="M7 24 L9 5 L22 13 Q24 12.6 26 13 L39 5 L41 24 Q43 31 38 36 Q33 43 24 43 Q15 43 10 36 Q5 31 7 24 Z" fill="var(--accent)" />
      <path d="M11 11 L18 15 Q14 17 12 21 Z" fill="#ffd3dc" />
      <path d="M37 11 L30 15 Q34 17 36 21 Z" fill="#ffd3dc" />
      <ellipse cx="17" cy="26" rx="2.6" ry="3.2" fill="#3d2c3a" />
      <ellipse cx="31" cy="26" rx="2.6" ry="3.2" fill="#3d2c3a" />
      <circle cx="17.9" cy="24.8" r="1" fill="#fff" />
      <circle cx="31.9" cy="24.8" r="1" fill="#fff" />
      <path d="M22 31 L26 31 L24 33.6 Z" fill="#ffd3dc" />
      <path d="M24 33.6 Q24 36 21.5 36.2 M24 33.6 Q24 36 26.5 36.2" fill="none" stroke="#3d2c3a" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 29 L13 30 M4 34 L13 33 M44 29 L35 30 M44 34 L35 33" stroke="#fff" strokeOpacity=".85" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
