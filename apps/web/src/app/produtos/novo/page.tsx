import { auth } from "@/lib/auth";
import { apiServerFetch } from "@/lib/api-client";
import { AppShell } from "@/components/shell/app-shell";
import { ProductForm } from "@/components/produtos/product-form";
import type { ProductTemplate, Category, Supplier } from "@/types/product";

interface ChannelStatusEntry {
  key: string;
  label?: string;
  configured?: boolean;
  hasCredentials?: boolean;
}

function buildChannelStatus(channels: ChannelStatusEntry[]) {
  const map: Record<string, { hasCredentials: boolean }> = {};
  for (const c of channels) {
    map[c.key] = { hasCredentials: Boolean(c.configured || c.hasCredentials) };
  }
  return map;
}

export default async function NovoProdutoPage() {
  const session = await auth();
  const [templates, categories, suppliers, channels] = await Promise.all([
    apiServerFetch<ProductTemplate[]>("/product-templates").catch(() => [] as ProductTemplate[]),
    apiServerFetch<Category[]>("/categories").catch(() => [] as Category[]),
    apiServerFetch<Supplier[]>("/suppliers").catch(() => [] as Supplier[]),
    apiServerFetch<ChannelStatusEntry[]>("/channels").catch(() => [] as ChannelStatusEntry[]),
  ]);

  return (
    <AppShell userName={session?.user?.name ?? ""}>
      <ProductForm
        templates={templates}
        categories={categories}
        suppliers={suppliers}
        channelStatus={buildChannelStatus(channels)}
      />
    </AppShell>
  );
}
