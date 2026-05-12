import type { CreateInvoiceBody } from "shared";
import { prisma } from "../lib/prisma";

function getDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function createNumber(dateKey: string, counter: number): string {
  return `INV-${dateKey}-${String(counter).padStart(4, "0")}`;
}

function roundHalfEven(num: number) {
  const floor = Math.floor(num);
  const diff = num - floor;

  if (diff < 0.5) return floor;
  if (diff > 0.5) return floor + 1;

  return floor % 2 === 0 ? floor : floor + 1;
}

export async function createInvoice(body: CreateInvoiceBody) {
  const subtotalMinor = body.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPriceMinor,
    0,
  );

  const taxMinor = roundHalfEven(subtotalMinor * (body.taxRateBps / 10_000));

  const totalMinor = subtotalMinor + taxMinor;
  const yearMonth = getDateKey();

  // start atomic transaction
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "InvoiceCounter" ("yearMonth", "current")
      VALUES (${yearMonth}, 1) 
      ON CONFLICT ("yearMonth") DO NOTHING
                         `;

    const counterRows = await tx.$queryRaw<{ current: number }[]>`
      SELECT "current" 
      FROM "InvoiceCounter" 
      WHERE "yearMonth" = ${yearMonth} 
      FOR UPDATE
    `; // aquire lock for current counter

    const currentCounter = counterRows[0]!.current;

    const invoiceNumber = createNumber(yearMonth, currentCounter);

    await tx.invoiceCounter.update({
      where: { yearMonth: yearMonth },
      data: { current: { increment: 1 } },
    });

    await tx.invoice.create({
      data: {
        number: invoiceNumber,
        customerName: body.customerName,
        customerEmail: body.customerEmail,

        lineItems: {
          create: body.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
          })),
        },

        currency: body.currency,
        subtotalMinor: subtotalMinor,
        taxMinor: taxMinor,
        totalMinor: totalMinor,
        taxRateBps: body.taxRateBps,
        dueAt: body.dueAt,
      },
    });
  }); // commit
}
