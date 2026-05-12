import { z } from "zod";

export type InvoiceStatus = "draft" | "issued" | "paid" | "void";

export const InvoiceLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
});
export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;

const common_data = {
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email format").nonoptional(),
  currency: z.string().length(3),
  taxRateBps: z.number().int().nonnegative().nonoptional(),
  dueAt: z
    .string()
    .datetime()
    .refine((v) => new Date(v) > new Date(), {
      message: "Due date must be in the future",
    })
    .nonoptional(),
  lineItems: z.array(InvoiceLineItemSchema).min(1),
};

export const CreateInvoiceSchema = z.object(common_data);
export type CreateInvoiceBody = z.infer<typeof CreateInvoiceSchema>;

export const InvoiceSchema = z.object({
  ...common_data,
  dueAt: z.string().datetime().nonoptional(),
  number: z
    .string()
    .regex(/^INV-\d{6}-\d{4}$/, "Invalid invoice number format")
    .nonoptional(),
  status: z.enum(["draft", "issued", "paid", "void"]).nonoptional(),
  subtotalMinor: z.number().nonoptional(),
  taxMinor: z.number().nonoptional(),
  totalMinor: z.number().nonoptional(),
  issuedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime().nonoptional(),
});
export type GetInvoiceData = z.infer<typeof InvoiceSchema>;
