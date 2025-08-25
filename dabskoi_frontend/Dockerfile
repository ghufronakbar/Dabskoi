# ---------- Builder ----------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # deps dulu biar cache maksimal
    COPY package*.json ./
    RUN npm ci
    
    # copy source (termasuk .env jika perlu saat build)
    COPY . .
    
    # build next ke mode standalone (butuh next.config.js: output:'standalone')
    RUN npm run build
    
    # ---------- Runner (standalone) ----------
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    
    # (opsional) untuk lib yang kadang dibutuhkan sharp (image optimization)
    RUN apk add --no-cache libc6-compat
    
    # copy hasil build standalone + static + public
    # .next/standalone berisi server.js + node_modules minimal runtime
    COPY --from=builder /app/.next/standalone ./ 
    # static assets harus ada di .next/static
    COPY --from=builder /app/.next/static ./.next/static
    # public assets
    COPY --from=builder /app/public ./public
    
    # jika kamu pakai custom next.config.js runtime (jarang perlu), copy juga:
    # COPY --from=builder /app/next.config.js ./next.config.js
    
    EXPOSE 3000
    # server.js ada di root (hasil copy standalone)
    CMD ["node", "server.js"]
    