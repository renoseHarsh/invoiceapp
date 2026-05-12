import Fastify from "fastify";
import { createInvoice } from "./service/invoice";
import { CreateInvoiceSchema } from "shared";
import cors from "@fastify/cors";

const fastify = Fastify();

await fastify.register(cors, {
  origin: "*",
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

fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
