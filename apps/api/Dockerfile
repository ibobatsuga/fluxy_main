FROM node:22-slim AS base
WORKDIR /repo
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
RUN npm install

FROM deps AS build
COPY packages/db packages/db
COPY apps/api apps/api
RUN npm run generate --workspace=@fluxy-crm/db
RUN npm run build --workspace=@fluxy-crm/api

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/db ./packages/db
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
WORKDIR /repo/apps/api
EXPOSE 4000
# Applies pending migrations against DATABASE_URL, then starts the server.
# Safe to run on every boot: `migrate deploy` is a no-op when there's nothing new.
CMD sh -c "cd /repo/packages/db && npx prisma migrate deploy && cd /repo/apps/api && node dist/index.js"
