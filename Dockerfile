FROM node:24

WORKDIR /app


RUN corepack enable


COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

COPY packages/shared/package.json packages/shared/

RUN pnpm install

COPY . .

RUN pnpm build

CMD ["sh", "-c", "pnpm --filter api exec prisma migrate deploy && pnpm start"]
