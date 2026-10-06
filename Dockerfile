FROM node:22.20.0-bookworm-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

RUN npm install --global npm@10.9.3 --no-audit --no-fund \
    && test "$(node --version)" = "v22.20.0" \
    && test "$(npm --version)" = "10.9.3"
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS builder

# NEXT_PUBLIC_* values are public and are embedded in the browser bundle at build time.
ARG NEXT_PUBLIC_BACKEND_URL=""
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
COPY . .
RUN npm run build \
    && rm -rf .next/cache/webpack .next/cache/swc .next/cache/eslint

FROM deps AS production-deps

RUN npm prune --omit=dev --ignore-scripts --no-audit --no-fund

FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/next.config.js ./
COPY --from=builder /app/public ./public
# Next.js writes optimized images and revalidation data under .next at runtime.
COPY --from=builder --chown=node:node /app/.next ./.next

USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0"]
