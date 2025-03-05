FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Generate Prisma client
COPY prisma ./prisma/
RUN pnpm dlx prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Start the application
CMD ["pnpm", "run", "start:prod"]