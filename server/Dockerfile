FROM node:18-alpine

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 ws

# Change ownership
RUN chown -R ws:nodejs /app

# Switch to non-root user
USER ws

# Expose port
EXPOSE 3001

# Start server
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
