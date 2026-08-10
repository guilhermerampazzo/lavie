import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiServerFetch, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { ProductForm } from "@/components/produtos/product-form";
import type { Product, ProductTemplate, Category, Supplier } from "@/types/product";

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const [product, templates, categories, suppliers] = await Promise.all([
    apiServerFetch<Product>(`/products/${params.id}`).catch((err) => {
      if (err instanceof ApiError && err.status === 404) notFound();
      throw err;
    }),
    apiServerFetch<ProductTemplate[]>("/product-templates").catch(() => [] as ProductTemplate[]),
    apiServerFetch<Category[]>("/categories").catch(() => [] as Category[]),
    apiServerFetch<Supplier[]>("/suppliers").catch(() => [] as Supplier[]),
  ]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <ProductForm
        templates={templates}
        categories={categories}
        suppliers={suppliers}
        initial={product}
      />
    </AppShell>
  );
}
