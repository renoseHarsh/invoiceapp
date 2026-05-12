import type {
  CreateInvoiceBody,
  GetInvoiceData,
  InvoiceLineItem,
  PaginatedInvoice,
} from "shared";
import { prisma } from "../lib/prisma";
import type { InvoiceStatus } from "../../generated/prisma/enums";

function getDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function createNumber(dateKey: string, counter: number): string {
  return `INV-${dateKey}-${String(counter).padStart(4, "0")}`;
}

function calculateTax(subtotalMinor: number, taxBps: number) {
  const product = subtotalMinor * taxBps;
  const quotient = Math.floor(product / 10_000);
  const remainder = product % 10_0000;

  if (remainder < 5000) return quotient + 1;
  if (remainder > 5000) return quotient;

  return quotient % 2 === 0 ? quotient : quotient + 1;
}

export async function createInvoice(body: CreateInvoiceBody) {
  const subtotalMinor = body.lineItems.reduce(
    (acc: number, item: InvoiceLineItem) =>
      acc + item.quantity * item.unitPriceMinor,
    0,
  );

  const taxMinor = calculateTax(subtotalMinor, body.taxRateBps);

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
          create: body.lineItems.map((item: InvoiceLineItem) => ({
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

export async function getInvoice(id: number): Promise<GetInvoiceData | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lineItems: true,
    },
  });

  if (!invoice) return null;

  return {
    id: invoice.id,
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail,
    currency: invoice.currency,
    taxRateBps: invoice.taxRateBps,
    dueAt: invoice.dueAt.toISOString(),
    lineItems: invoice.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
    })),
    number: invoice.number,
    status: invoice.status,
    subtotalMinor: invoice.subtotalMinor,
    taxMinor: invoice.taxMinor,
    totalMinor: invoice.totalMinor,
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
  };
}

export async function updateStatus(
  id: number,
  status: InvoiceStatus,
): Promise<200 | 404 | 403> {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
  });

  if (!invoice) return 404;

  let canUpdate = false;
  const update: {
    status: InvoiceStatus;
    issuedAt?: Date;
  } = { status };

  if (invoice.status === "draft" && status === "issued") {
    update.issuedAt = new Date();
    canUpdate = true;
  } else if (
    invoice.status == "issued" &&
    (status == "paid" || status == "void")
  ) {
    canUpdate = true;
  }

  if (!canUpdate) return 403;

  await prisma.invoice.update({
    where: { id },
    data: update,
  });

  return 200;
}

export async function getPaginatedList(
  page: number,
): Promise<PaginatedInvoice> {
  const pageSize = 10;

  const items = await prisma.invoice.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      number: true,
      customerName: true,
      status: true,
      totalMinor: true,
      currency: true,
    },
  });

  const totalItem = await prisma.invoice.count();

  const totalPages = Math.ceil(totalItem / pageSize);

  return { items, page, totalPages };
}
