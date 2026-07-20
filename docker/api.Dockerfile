FROM node:20-alpine AS base
RUN apk add --no-cache openssl
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/nuvemshop/package.json packages/nuvemshop/package.json
COPY packages/bling/package.json packages/bling/package.json
COPY packages/evolution/package.json packages/evolution/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/product-template/package.json packages/product-template/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app ./
COPY . .
RUN pnpm --filter @lavie/db generate
RUN pnpm build:packages
RUN pnpm --filter @lavie/api build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
