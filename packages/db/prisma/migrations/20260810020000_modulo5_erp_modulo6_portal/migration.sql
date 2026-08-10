-- Módulo 5 — ERP (estoque, NF-e, financeiro) + Módulo 6 (portal: pagamento, kits, trocas)

-- 1) Movimentações de estoque
CREATE TYPE "StockMovementType" AS ENUM (
    'entrada', 'saida', 'consignacao_saida', 'consignacao_retorno', 'devolucao', 'ajuste'
);
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productId" TEXT,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StockMovement_variantId_idx" ON "StockMovement"("variantId");
CREATE INDEX "StockMovement_type_createdAt_idx" ON "StockMovement"("type", "createdAt");

-- 2) NF-e (Bling)
CREATE TYPE "InvoiceStatus" AS ENUM ('rascunho', 'emitida', 'cancelada');
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "blingInvoiceId" TEXT,
    "number" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'rascunho',
    "issueDate" TIMESTAMP(3),
    "total" DECIMAL(10,2) NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");
CREATE UNIQUE INDEX "Invoice_blingInvoiceId_key" ON "Invoice"("blingInvoiceId");
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3) Financeiro (contas a receber/pagar)
CREATE TYPE "AccountStatus" AS ENUM ('aberta', 'paga', 'atrasada');
CREATE TYPE "AccountType" AS ENUM ('receivable', 'payable');
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'aberta',
    "paidAt" TIMESTAMP(3),
    "orderId" TEXT,
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Account_type_status_idx" ON "Account"("type", "status");
CREATE INDEX "Account_dueDate_idx" ON "Account"("dueDate");

-- 4) Pagamento do pedido do portal
CREATE TYPE "PaymentMethod" AS ENUM ('boleto', 'pix', 'transferencia', 'credito_em_conta');
CREATE TYPE "PaymentStatus" AS ENUM ('pendente', 'pago', 'cancelado');
ALTER TABLE "ResellerOrder" ADD COLUMN "paymentMethod" "PaymentMethod";
ALTER TABLE "ResellerOrder" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pendente';

-- 5) Trocas/devoluções
CREATE TYPE "ReturnStatus" AS ENUM ('solicitada', 'aprovada', 'recusada', 'concluida');
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "resellerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'solicitada',
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReturnRequest_resellerId_status_idx" ON "ReturnRequest"("resellerId", "status");
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_resellerId_fkey"
    FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6) Kits exclusivos
CREATE TABLE "ResellerKit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResellerKit_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ResellerKitItem" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ResellerKitItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResellerKitItem_kitId_productId_key" ON "ResellerKitItem"("kitId", "productId");
ALTER TABLE "ResellerKitItem" ADD CONSTRAINT "ResellerKitItem_kitId_fkey"
    FOREIGN KEY ("kitId") REFERENCES "ResellerKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
