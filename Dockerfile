FROM mcr.microsoft.com/playwright:v1.48.2-jammy

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev) for building
# Use npm install to avoid lockfile mismatch failures in remote builds
RUN npm install --no-audit --no-fund

# Install system Google Chrome (MCP defaults to channel 'chrome' at /opt/google/chrome/chrome)
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux-keyring.gpg && \
    sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Ensure Playwright browsers also present (chromium + chrome channel)
RUN npx playwright install --with-deps chromium && \
    npx playwright install chrome

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

CMD ["node", "dist/agent.js"]