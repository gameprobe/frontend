FROM node:22.20.0-bookworm-slim AS base
WORKDIR /app

FROM base AS builder
RUN npm install --global npm@10.9.3 --no-audit --no-fund \
    && test "$(node --version)" = "v22.20.0" \
    && test "$(npm --version)" = "10.9.3"
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Public origin only. Vite embeds this value in the browser bundle at build time.
ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000
COPY --from=builder /app/dist ./dist
COPY scripts/serve.mjs ./scripts/serve.mjs
USER node
EXPOSE 3000
CMD ["node", "scripts/serve.mjs"]
