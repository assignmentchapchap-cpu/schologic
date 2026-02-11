
FROM node:24.13-alpine

# Install helpful tools
RUN apk add --no-cache git libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package management files to leverage cache
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* turbo.json ./

# Copy the rest of the code
COPY . .

# Skip Supabase CLI download (not needed in container - using Supabase Cloud)
ENV SUPABASE_SKIP_DOWNLOAD=1

# Install dependencies (skip postinstall scripts to avoid supabase CLI download network issues)
RUN pnpm install --ignore-scripts

# Run only the necessary postinstall scripts (skip supabase which needs network)
RUN pnpm rebuild sharp || true

# Expose Next.js default port
EXPOSE 3000

# Default command
CMD ["pnpm", "dev"]
