/*
  Warnings:

  - The primary key for the `Invoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `InvoiceCounter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `InvoiceCounter` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `InvoiceLineItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `InvoiceLineItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `dueAt` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `invoiceId` on the `InvoiceLineItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "InvoiceLineItem" DROP CONSTRAINT "InvoiceLineItem_invoiceId_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "dueAt" SET NOT NULL,
ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "InvoiceCounter" DROP CONSTRAINT "InvoiceCounter_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "InvoiceCounter_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "InvoiceLineItem" DROP CONSTRAINT "InvoiceLineItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "invoiceId",
ADD COLUMN     "invoiceId" INTEGER NOT NULL,
ADD CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
