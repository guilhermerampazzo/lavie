-- Módulo 4 — CRM Sob Medida: automações de follow-up, grupo VIP e materiais

-- 1) Marcação Grupo VIP no cliente (WhatsApp)
ALTER TABLE "Customer" ADD COLUMN "whatsappVip" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Customer_whatsappVip_idx" ON "Customer"("whatsappVip");

-- 2) Log de automações (dedupe de disparos)
CREATE TABLE "AutomationLog" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "customerId" TEXT,
    "status" TEXT NOT NULL,
    "detail" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AutomationLog_trigger_targetId_key" ON "AutomationLog"("trigger", "targetId");
CREATE INDEX "AutomationLog_trigger_customerId_idx" ON "AutomationLog"("trigger", "customerId");

ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) Material de divulgação de afiliadas
CREATE TABLE "AffiliateMaterial" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateMaterial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AffiliateMaterial_affiliateId_idx" ON "AffiliateMaterial"("affiliateId");

ALTER TABLE "AffiliateMaterial" ADD CONSTRAINT "AffiliateMaterial_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
