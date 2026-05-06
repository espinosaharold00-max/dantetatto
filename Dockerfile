FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=deps /app/node_modules/effect ./node_modules/effect
COPY --from=deps /app/node_modules/c12 ./node_modules/c12
COPY --from=deps /app/node_modules/deepmerge-ts ./node_modules/deepmerge-ts
COPY --from=deps /app/node_modules/empathic ./node_modules/empathic
COPY --from=deps /app/node_modules/confbox ./node_modules/confbox
COPY --from=deps /app/node_modules/defu ./node_modules/defu
COPY --from=deps /app/node_modules/destr ./node_modules/destr
COPY --from=deps /app/node_modules/exsolve ./node_modules/exsolve
COPY --from=deps /app/node_modules/giget ./node_modules/giget
COPY --from=deps /app/node_modules/jiti ./node_modules/jiti
COPY --from=deps /app/node_modules/ohash ./node_modules/ohash
COPY --from=deps /app/node_modules/pathe ./node_modules/pathe
COPY --from=deps /app/node_modules/perfect-debounce ./node_modules/perfect-debounce
COPY --from=deps /app/node_modules/pkg-types ./node_modules/pkg-types
COPY --from=deps /app/node_modules/rc9 ./node_modules/rc9
COPY --from=deps /app/node_modules/chokidar ./node_modules/chokidar
COPY --from=deps /app/node_modules/picomatch ./node_modules/picomatch
COPY --from=deps /app/node_modules/readdirp ./node_modules/readdirp
COPY --from=deps /app/node_modules/@standard-schema ./node_modules/@standard-schema
COPY --from=deps /app/node_modules/fast-check ./node_modules/fast-check
COPY --from=deps /app/node_modules/pure-rand ./node_modules/pure-rand
RUN mkdir -p node_modules/.bin && ln -sf ../prisma/build/index.js node_modules/.bin/prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
