import Link from "next/link";

// Лого: качената от админа снимка или котенцето по подразбиране + името
export default function Brand({ logo, name, plain = false }) {
  const inner = <img src={logo || "/logo.png"} alt={name} className="logo-img" />;
  return plain ? <div className="brand">{inner}</div> : <Link href="/" className="brand" aria-label={name}>{inner}</Link>;
}
