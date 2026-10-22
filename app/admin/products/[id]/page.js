import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "../../AdminNav";
import { getCategoryNames } from "@/lib/categories";
import ProductForm from "../ProductForm";
import { deleteProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }) {
  requireAdmin();
  const { data: p } = await db().from("products").select("*").eq("id", params.id).maybeSingle();
  if (!p) notFound();
  return (
    <>
      <AdminNav />
      <h1 style={{ fontSize: 24 }}>Редакция</h1>
      <ProductForm product={p} categories={await getCategoryNames()} />
      <form action={deleteProduct} style={{ marginTop: 16 }}>
        <input type="hidden" name="id" value={p.id} />
        <button className="btn danger sm">Изтрий продукта</button>
      </form>
    </>
  );
}
