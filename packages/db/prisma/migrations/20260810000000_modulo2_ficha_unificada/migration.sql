-- Módulo 2 — Ficha unificada de produto, fornecedores e canais
-- (escopofinal.md seção 3)

-- 1) Novo status de produto: "em_revisao" (inicia o ciclo de vida do produto)
ALTER TYPE "ProductStatus" ADD VALUE 'em_revisao';

-- 2) Supplier (fornecedores — preenchidos via OCR de NF)
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "code" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Supplier_document_idx" ON "Supplier"("document");

-- 3) ProductChannel (canais de venda selecionados por produto)
CREATE TYPE "ProductChannelType" AS ENUM (
    'site', 'nuvemshop', 'instagram', 'tiktok', 'mercado_livre',
    'shopee', 'amazon', 'shein', 'revendedora', 'fisico'
);

CREATE TABLE "ProductChannel" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "channel" "ProductChannelType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductChannel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductChannel_productId_channel_key" ON "ProductChannel"("productId", "channel");
CREATE INDEX "ProductChannel_channel_idx" ON "ProductChannel"("channel");

-- 4) Campos novos da ficha unificada em Product
ALTER TABLE "Product" ADD COLUMN "skuInterno" TEXT;
ALTER TABLE "Product" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "tipoPeca" TEXT;
ALTER TABLE "Product" ADD COLUMN "material" TEXT;
ALTER TABLE "Product" ADD COLUMN "corAcabamento" TEXT;
ALTER TABLE "Product" ADD COLUMN "estilo" TEXT;
ALTER TABLE "Product" ADD COLUMN "colecao" TEXT;
ALTER TABLE "Product" ADD COLUMN "instrucoesConservacao" TEXT;
ALTER TABLE "Product" ADD COLUMN "precoCusto" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "estoqueMinimo" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "pesoGramas" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "dimensoes" TEXT;
ALTER TABLE "Product" ADD COLUMN "dataEntrada" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "supplierId" TEXT;

CREATE UNIQUE INDEX "Product_skuInterno_key" ON "Product"("skuInterno");
CREATE INDEX "Product_supplierId_idx" ON "Product"("supplierId");
CREATE INDEX "Product_tipoPeca_idx" ON "Product"("tipoPeca");

-- 5) FK Product -> Supplier e Product -> ProductChannel
ALTER TABLE "ProductChannel" ADD CONSTRAINT "ProductChannel_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey"
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
