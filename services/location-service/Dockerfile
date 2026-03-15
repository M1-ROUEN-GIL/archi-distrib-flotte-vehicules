#BUILD
FROM node:18-alpine AS builder
WORKDIR /app

# Copier les fichiers de dependances
COPY package *.json

# Installer les dependances
RUN npm install
# Copier le reste du code source
COPY . .

# Construire l'application
FROM node:18-alpine
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app .
USER nodejs
EXPOSE 3002
CMD ["node" , "src /app.js"]