FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG PUBLIC_OTEL_COLLECTOR_URL=http://localhost:3000
ENV PUBLIC_OTEL_COLLECTOR_URL=$PUBLIC_OTEL_COLLECTOR_URL
RUN npm run build

FROM nginx:alpine
COPY observability/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
