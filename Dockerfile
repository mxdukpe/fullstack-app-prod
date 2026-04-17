# ========== STAGE 1 : Build ==========
FROM node:20-alpine AS builder
WORKDIR /app

# Dépendances d'abord (pour profiter du cache Docker)
COPY package.json package-lock.json* ./
RUN npm ci

# Code source
COPY . .

# On nettoie pour ne garder que les dépendances utiles en production (enlève les devDependencies)
RUN npm prune --production

# ========== STAGE 2 : Production ==========
FROM node:20-alpine AS production
WORKDIR /app

# Création d'un utilisateur "non-root" (sans privilège) pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# On ne copie depuis le "builder" QUE ce qui est nécessaire pour l'exécution
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

# Définition de l'utilisateur sécurisé
USER appuser

EXPOSE 3000
ENV NODE_ENV=production

# Healthcheck natif Docker (il tapera notre route /health)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
