FROM mcr.microsoft.com/playwright:v1.48.2-jammy

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev) for building
# Use npm install to avoid lockfile mismatch failures in remote builds
RUN npm install --no-audit --no-fund

# Copy TypeScript config and source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create a non-root user to run the application
RUN useradd -m -s /bin/bash agent && \
    chown -R agent:agent /app

USER agent

# Set environment variables
ENV CHROMIUM_PATH=/usr/bin/chromium

CMD ["node", "dist/index.js"]