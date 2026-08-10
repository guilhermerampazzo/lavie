import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiServerFetch, ApiError } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { LabelPrint } from "@/components/produtos/label-print";
import type { ProductLabel } from "@/types/product";

export default async function EtiquetaPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const label = await apiServerFetch<ProductLabel>(`/products/${params.id}/label`).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <LabelPrint label={label} />
    </AppShell>
  );
}
