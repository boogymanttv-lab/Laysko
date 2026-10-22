import Link from "next/link";
import CatLogo from "./CatLogo";

// Лого: качената от админа снимка или котенцето по подразбиране + името
export default function Brand({ logo, name, plain = false }) {
  const inner = logo ? (
    <img src={logo} alt={name} className="logo-img" />
  ) : (
    <>
      <CatLogo />
      <span className="wordmark">{name}</span>
    </>
  );
  return plain ? <div className="brand">{inner}</div> : <Link href="/" className="brand" aria-label={name}>{inner}</Link>;
}
