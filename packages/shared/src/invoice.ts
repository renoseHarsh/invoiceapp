import { z } from "zod";

export const CreateInvoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email format"),
  currency: z.string().length(3),
  taxRateBps: z.number().int().nonnegative(),
  dueAt: z
    .string()
    .datetime()
    .refine((v) => new Date(v) > new Date(), {
      message: "Due date must be in the future",
    }),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPriceMinor: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export type CreateInvoiceBody = z.infer<typeof CreateInvoiceSchema>;
