FROM node:18-alpine

WORKDIR /app

# Install Docker CLI for managing containers
RUN apk add --no-cache docker-cli dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user with docker group
RUN addgroup -S -g 1000 challenge && \
    adduser -S -u 1000 -G challenge challenge

# Change ownership
RUN chown -R challenge:challenge /app

# Switch to non-root user
USER challenge

# Expose management API port
EXPOSE 3002

# Start service
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
