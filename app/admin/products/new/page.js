import { requireAdmin } from "@/lib/auth";
import AdminNav from "../../AdminNav";
import { getCategoryNames } from "@/lib/categories";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  requireAdmin();
  return (
    <>
      <AdminNav />
      <h1 style={{ fontSize: 24 }}>Нов продукт</h1>
      <ProductForm categories={await getCategoryNames()} />
    </>
  );
}
