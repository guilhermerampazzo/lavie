-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_templateId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "nomePeca" DROP NOT NULL,
ALTER COLUMN "banhoMaterial" DROP NOT NULL,
ALTER COLUMN "cor" DROP NOT NULL,
ALTER COLUMN "templateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProductTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
