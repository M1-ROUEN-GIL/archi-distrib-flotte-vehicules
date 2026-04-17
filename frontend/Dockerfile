# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY apps/shell/package*.json ./apps/shell/
COPY apps/vehicles/package*.json ./apps/vehicles/
COPY apps/drivers/package*.json ./apps/drivers/
COPY apps/maintenance/package*.json ./apps/maintenance/
COPY apps/location/package*.json ./apps/location/
COPY packages/shared-auth/package*.json ./packages/shared-auth/
COPY packages/shared-client/package*.json ./packages/shared-client/
COPY packages/shared-ui/package*.json ./packages/shared-ui/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build all apps
# Note: We'll set the base path for each remote app
RUN cd apps/vehicles && npm run build -- --base=/remotes/vehicles/
RUN cd apps/drivers && npm run build -- --base=/remotes/drivers/
RUN cd apps/maintenance && npm run build -- --base=/remotes/maintenance/
RUN cd apps/location && npm run build -- --base=/remotes/location/
RUN cd apps/shell && npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/apps/shell/dist /usr/share/nginx/html
COPY --from=build /app/apps/vehicles/dist /usr/share/nginx/html/remotes/vehicles
COPY --from=build /app/apps/drivers/dist /usr/share/nginx/html/remotes/drivers
COPY --from=build /app/apps/maintenance/dist /usr/share/nginx/html/remotes/maintenance
COPY --from=build /app/apps/location/dist /usr/share/nginx/html/remotes/location

# Add nginx config to handle SPA routing and keycloak proxy
RUN echo 'server { \
    listen 80; \
    location /auth/ { \
        proxy_pass http://keycloak-service:8080/auth/; \
        proxy_set_header Host $http_host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_set_header X-Forwarded-Host $http_host; \
    } \
    location /graphql { \
        proxy_pass http://gateway:4000/graphql; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /remotes/vehicles/ { \
        alias /usr/share/nginx/html/remotes/vehicles/; \
        try_files $uri $uri/ /remotes/vehicles/index.html; \
    } \
    location /remotes/drivers/ { \
        alias /usr/share/nginx/html/remotes/drivers/; \
        try_files $uri $uri/ /remotes/drivers/index.html; \
    } \
    location /remotes/maintenance/ { \
        alias /usr/share/nginx/html/remotes/maintenance/; \
        try_files $uri $uri/ /remotes/maintenance/index.html; \
    } \
    location /remotes/location/ { \
        alias /usr/share/nginx/html/remotes/location/; \
        try_files $uri $uri/ /remotes/location/index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
