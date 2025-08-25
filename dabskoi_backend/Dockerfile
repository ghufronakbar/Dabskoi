FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

# Copy semua file lebih awal, termasuk prisma & env
COPY . .

# Pastikan .env.production ada di image
COPY .env .env

# Install dependensi
RUN npm install

# Generate Prisma Client (pakai .env lokal tapi bukan jalankan migrate dulu)
RUN npx prisma generate

# Build
RUN npm run build

# Hapus devDependencies
RUN npm prune --production

# Set NODE_ENV
ENV NODE_ENV=production

# Ekspose port backend
EXPOSE 2001

# Jalankan migration saat container run, bukan saat build
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm start"]
