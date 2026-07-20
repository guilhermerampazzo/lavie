export interface ProductTemplateBlocks {
  openingParagraph: string;
  manufacturingBlock: string;
  careBlock: string;
}

export interface ProductTemplateVariables {
  nomePeca: string;
  banhoMaterial: string;
  cor: string;
  tamanho?: string | null;
  fecho?: string | null;
  hipoalergenico: boolean;
}

export interface RenderedProduct {
  nome: string;
  descricao: string;
}

function interpolate(text: string, vars: ProductTemplateVariables): string {
  return text
    .replaceAll("{{nomePeca}}", vars.nomePeca)
    .replaceAll("{{banhoMaterial}}", vars.banhoMaterial)
    .replaceAll("{{cor}}", vars.cor)
    .replaceAll("{{tamanho}}", vars.tamanho ?? "")
    .replaceAll("{{fecho}}", vars.fecho ?? "");
}

/** Monta [nomePeca] [banhoMaterial] [cor] [Hipoalergênico?] — escopo.md secao 8.3. */
export function renderProductName(vars: ProductTemplateVariables): string {
  const parts = [vars.nomePeca, vars.banhoMaterial, vars.cor];
  if (vars.hipoalergenico) parts.push("Hipoalergênico");
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

/** Monta a descricao: abertura (com slots) + ficha + blocos fixos — escopo.md secao 8.3. */
export function renderProductDescription(
  blocks: ProductTemplateBlocks,
  vars: ProductTemplateVariables,
): string {
  const opening = interpolate(blocks.openingParagraph, vars);

  const fichaLines = [`Tamanho: ${vars.tamanho ?? "-"}`];
  if (vars.hipoalergenico) fichaLines.push("✓ Hipoalergênico");
  fichaLines.push(`Material: ${vars.banhoMaterial}`, `Cor: ${vars.cor}`);
  const ficha = fichaLines.join("\n");

  const manufacturing = interpolate(blocks.manufacturingBlock, vars);
  const care = interpolate(blocks.careBlock, vars);

  return [opening, ficha, manufacturing, care].filter(Boolean).join("\n\n");
}

export function renderProduct(
  blocks: ProductTemplateBlocks,
  vars: ProductTemplateVariables,
): RenderedProduct {
  return {
    nome: renderProductName(vars),
    descricao: renderProductDescription(blocks, vars),
  };
}
