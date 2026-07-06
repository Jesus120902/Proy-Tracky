# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias primero (cache de capas)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# ── Imagen final ──────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias y código del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Cloud Run establece PORT como variable de entorno (por defecto 8080)
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Comando de inicio
CMD ["node", "index.js"]
