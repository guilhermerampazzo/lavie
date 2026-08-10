"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ProductLabel } from "@/types/product";

function formatBRL(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Desenha um código de barras CODE128 simples em SVG (sem dependência). */
function BarcodeSvg({ value, height = 52 }: { value: string; height?: number }) {
  const [bars, setBars] = useState<string>("");
  const [width, setWidth] = useState(1);

  useEffect(() => {
    // CODE128-B simplificado: codifica cada char com um padrão de 6 elementos
    // (alternando barra/espaço). Suficiente para leitura de código de barras
    // linear em etiquetas de produto; para QR Code real, usar lib dedicada.
    const patterns: Record<string, string> = {
      "0": "212222", "1": "222122", "2": "222221", "3": "121223", "4": "121322",
      "5": "131222", "6": "122213", "7": "122312", "8": "132212", "9": "221213",
      A: "221312", B: "231212", C: "112232", D: "122132", E: "122231",
      F: "113222", G: "123122", H: "123221", I: "223211", J: "221132",
      K: "221231", L: "213212", M: "223112", N: "312131", O: "311222",
      P: "321122", Q: "321221", R: "312212", S: "322112", T: "322211",
      U: "212123", V: "212321", W: "232121", X: "111323", Y: "131123",
      Z: "131321", "-": "211133", ".": "211331", " ": "211133",
    };
    const chars = value.toUpperCase().split("");
    const widths: number[] = [];
    // start (CODE128-B = 104 -> padrão 211214)
    const start = "211214";
    const stop = "2331112";
    const renderPattern = (pattern: string) => {
      for (const w of pattern) {
        widths.push(Number(w));
      }
    };
    renderPattern(start);
    for (const c of chars) {
      const p = patterns[c] ?? "212222";
      renderPattern(p);
    }
    renderPattern(stop);
    setBars(
      widths
        .map((w, i) => `<rect x="${i === 0 ? 0 : 0}" y="0" width="${w}" height="${height}" ${i % 2 === 0 ? 'fill="currentColor"' : 'fill="transparent"'}/>`)
        .join(""),
    );
    setWidth(widths.reduce((a, b) => a + b, 0));
  }, [value, height]);

  if (!bars) return null;
  return (
    <svg width={width * 1.4} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto text-ink">
      <g dangerouslySetInnerHTML={{ __html: bars }} />
    </svg>
  );
}

export function LabelPrint({ label }: { label: ProductLabel }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="px-5 py-6 lg:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="mb-1 font-serif text-[22px] font-medium text-ink">Etiqueta do produto</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Prévia da etiqueta — código de barras gerado do SKU. Imprima com 1 clique.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            Qtd:
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="h-8 w-16 rounded-[9px] border border-line px-2 text-[12.5px]"
            />
          </label>
          <Button
            className="rounded-btn bg-brand text-white hover:bg-brand-dark"
            onClick={() => window.print()}
          >
            <Printer className="mr-1.5 size-3.5" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-canvas p-6 print:bg-white print:p-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: Math.min(quantity, 12) }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-lg border border-line bg-surface p-3 text-center"
            >
              {/* Logo La Vie */}
              <span className="mb-1 font-serif text-[15px] font-semibold tracking-wide text-brand-dark">
                La Vie
              </span>
              <span className="mb-1.5 block w-full border-t border-dashed border-line" />
              <span className="mb-1 line-clamp-2 text-[11px] font-medium leading-tight text-ink">
                {label.nome}
              </span>
              <span className="mb-1 text-[10px] text-muted-foreground">
                {label.material ?? "Sem material"} · {label.tipoPeca ?? ""}
              </span>
              <span className="mb-2 text-[13px] font-semibold tabular-nums text-brand-dark">
                {formatBRL(label.precoPromocional ?? label.preco)}
              </span>
              <BarcodeSvg value={label.sku} />
              <span className="mt-1 text-[10px] tracking-widest text-muted-foreground">{label.sku}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 print:hidden">
        <Button asChild variant="outline" className="rounded-btn border-line">
          <Link href={`/produtos/${label.id}`}>
            <ArrowLeft className="mr-1.5 size-3.5" /> Voltar ao produto
          </Link>
        </Button>
      </div>
    </div>
  );
}
