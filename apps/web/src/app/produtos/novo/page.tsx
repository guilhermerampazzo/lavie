import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { ProductForm } from "@/components/produtos/product-form";
import type { ProductTemplate, Category } from "@/types/product";

export default async function NovoProdutoPage() {
  const session = await auth();
  const [templates, categories] = await Promise.all([
    apiServerFetch<ProductTemplate[]>("/product-templates").catch(() => [] as ProductTemplate[]),
    apiServerFetch<Category[]>("/categories").catch(() => [] as Category[]),
  ]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <ProductForm templates={templates} categories={categories} />
    </AppShell>
  );
}
