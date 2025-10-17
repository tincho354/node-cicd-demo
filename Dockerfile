# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# (Optional) If you have a build step (e.g., TypeScript), run it here.
# RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime

# Create non-root user
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp

WORKDIR /app

# Copy only production dependencies
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# Copy app source (if you have a dist/ use that instead)
COPY --from=build /app/src ./src

# Drop privileges
USER nodeusr

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "src/app.js"]
