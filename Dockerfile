FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Rsbuild inlines PUBLIC_* env vars at build time, so they must be
# available during `npm run build`, not just at container runtime.
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
