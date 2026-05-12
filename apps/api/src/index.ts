import Fastify from "fastify";
import { createInvoice, getInvoice, updateStatus } from "./service/invoice";
import { CreateInvoiceSchema, type GetInvoiceData } from "shared";
import cors from "@fastify/cors";
import type { InvoiceStatus } from "../generated/prisma/enums";

const fastify = Fastify();

await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT"],
});

fastify.post("/invoices", async (request, reply) => {
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
}>("/invoices/:id", async (request, reply) => {
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
}>("/invoices/:id/status", async (request, reply) => {
  const id = Number(request.params.id);
  const { status } = request.body;
  if (!status) return reply.status(400).send();
  return reply.status(await updateStatus(id, status)).send();
});

fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
