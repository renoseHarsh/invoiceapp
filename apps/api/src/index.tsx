import Fastify from "fastify";
import { InvoicePdf } from "./service/genpdf";
import {
  createInvoice,
  getInvoice,
  getPaginatedList,
  updateStatus,
} from "./service/invoice";
import {
  CreateInvoiceSchema,
  type GetInvoiceData,
  type PaginatedInvoice,
} from "shared";
import cors from "@fastify/cors";
import type { InvoiceStatus } from "../generated/prisma/enums";
import ReactPDF from "@react-pdf/renderer";
import fastifyStatic from "@fastify/static";
import path from "path";

const fastify = Fastify(
  { logger: true }
);

await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT"],
});

await fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), "apps/web/dist"),
});


fastify.post("/api/invoices", async (request, reply) => {
  const validationResult = CreateInvoiceSchema.safeParse(request.body);
  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation failed",
      issues: validationResult.error.message,
    });
  }
  await createInvoice(validationResult.data);
  return reply.status(201).send();
});

fastify.get<{
  Params: {
    id: string;
  };
  Reply: {
    404: {};
    200: GetInvoiceData;
  };
}>("/api/invoices/:id", async (request, reply) => {
  const id = Number(request.params.id);
  const data = await getInvoice(id);
  if (!data) return reply.status(404).send();
  return reply.status(200).send(data);
});

fastify.put<{
  Params: {
    id: string;
  };
  Body: {
    status: InvoiceStatus;
  };
}>("/api/invoices/:id/status", async (request, reply) => {
  const id = Number(request.params.id);
  const { status } = request.body;
  if (!status) return reply.status(400).send();
  return reply.status(await updateStatus(id, status)).send();
});

fastify.get<{
  Querystring: {
    page?: number;
  };
  Reply: {
    200: PaginatedInvoice;
  };
}>("/api/invoices", async (request, reply) => {
  const page = Number(request.query.page) ?? 1;
  const data = await getPaginatedList(page);
  return reply.status(200).send(data);
});

fastify.get<{
  Params: {
    id: string
  }
}>("/api/invoices/:id/pdf", async (request, reply) => {
  const id = Number(request.params.id)
  const invoice = await getInvoice(id)
  if (!invoice) return reply.status(404).send()
  const stream = await ReactPDF.renderToStream(
    <InvoicePdf invoice={invoice} />,);
  return reply.type("application/pdf").send(stream)
})

fastify.listen({ port: 3000, host: '0.0.0.0' }, function(err) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
