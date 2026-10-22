# Production image for Coolify (see README-Coolify.md).
#
# Build stage: build every Fiori app in app/, compile the TypeScript service,
# and produce the production bundle in gen/srv.
FROM node:22-alpine AS build
WORKDIR /app

# The UI apps' devDependencies include puppeteer for karma tests; skip Chromium.
ENV PUPPETEER_SKIP_DOWNLOAD=true

# All sources first: each app in app/ is an npm workspace that npm ci needs.
COPY . .
RUN npm ci --no-audit --no-fund
RUN npm run build --workspaces --if-present
# CDS_ENV=node selects the [node!] build tasks; the repo defaults to Java (pom.xml).
# cds build leaves out the initial data and the UIs, so copy them into the bundle.
RUN CDS_ENV=node npx cds build --production \
 && mkdir -p gen/srv/app gen/srv/db \
 && cp -r db/data gen/srv/db/data \
 && for dist in app/*/dist; do cp -r "$dist" "gen/srv/app/$(basename "$(dirname "$dist")")"; done

# Runtime stage: only the bundle and its production dependencies.
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/gen/srv ./
RUN npm ci --omit=dev --no-audit --no-fund
ENV NODE_ENV=production CDS_ENV=coolify PORT=4004
EXPOSE 4004
USER node
CMD ["npx", "cds-serve"]
