FROM node:22 as build
# Increase Node.js heap memory limit for resource-intensive Vite/Tailwind v4 builds
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy only the application source and configuration files
# This prevents copying local node_modules or env files even if .dockerignore is missing
COPY vite.config.js index.html ./
COPY src ./src
COPY public ./public

# Build the app for production
# Note: Vite embeds environment variables prefixed with VITE_ at build time.
# During docker build, these can be passed as --build-arg if needed.
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (Google Cloud Run's default port)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
