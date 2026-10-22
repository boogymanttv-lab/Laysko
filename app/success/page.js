import Link from "next/link";
import { Check } from "../Icons";
import ClearCart from "./ClearCart";

export const metadata = { title: "Благодарим!" };

export default function Success() {
  return (
    <div className="container center">
      <ClearCart />
      <div className="check"><Check width={36} height={36} /></div>
      <h1>Благодарим за поръчката!</h1>
      <p className="muted" style={{ maxWidth: 480, margin: "8px auto 28px", fontSize: 17 }}>
        Плащането е успешно. Ще получиш потвърждение на имейла си, а поръчката ще пристигне до 7–21 работни дни.
      </p>
      <Link href="/" className="btn primary lg">Обратно към магазина</Link>
    </div>
  );
}
