FROM node:22-slim AS base
WORKDIR /repo

FROM base AS deps
COPY package.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspace=@fluxy-crm/web

FROM deps AS build
COPY apps/web apps/web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build --workspace=@fluxy-crm/web

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
WORKDIR /repo/apps/web
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
