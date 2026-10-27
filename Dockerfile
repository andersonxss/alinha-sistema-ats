FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--dns-result-order=ipv4first
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --no-audit --fetch-retries=5 --fetch-timeout=300000 --loglevel=info

FROM dependencies AS development
ENV NODE_ENV=development
COPY --chown=node:node . .
RUN npm run db:generate && mkdir -p /data/resumes && chown -R node:node /app/backend/src/generated /data
USER node
EXPOSE 3000 4000
CMD ["npm", "run", "dev"]

FROM dependencies AS build
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
COPY . .
RUN BETTER_AUTH_SECRET=build-only-placeholder-not-used-at-runtime-123456 npm run build

FROM base AS production-deps
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --omit=dev --no-audit --fetch-retries=5 --fetch-timeout=300000 --loglevel=info

FROM base AS runtime
ENV NODE_ENV=production
ENV STORAGE_PATH=/data/resumes
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/frontend ./frontend
COPY --from=build /app/backend ./backend
COPY package.json ./package.json
RUN mkdir -p /data/resumes && chown node:node /data /data/resumes
USER node
EXPOSE 3000 4000
CMD ["npm", "start"]
